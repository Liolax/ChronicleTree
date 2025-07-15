import React, { useState, useMemo, useCallback } from "react";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import { LinkVertical } from '@visx/shape';
import Button from "../UI/Button";
import AddPersonModal from "./modals/AddPersonModal";
import EditPersonModal from "./modals/EditPersonModal";
import DeletePersonModal from '../UI/DeletePersonModal';
import PersonCard from "./PersonCard";
import { useFullTree } from "../../services/people";
import CustomNode from "./CustomNode";
import clsx from 'clsx';

// --- Layout Constants ---
const NODE_WIDTH = 190;
const NODE_HEIGHT = 150;
const SIBLING_SPACING = 40;
const GENERATION_SPACING = 200;

/**
 * Creates a robust, generational layout for a family tree graph.
 * Handles complex relationships by creating union nodes for couples.
 * Can be centered on any person in the tree.
 *
 * @param {Array} nodes - All person nodes from the API.
 * @param {Array} edges - All relationship edges from the API.
 * @param {string|null} rootId - The ID of the person to center the tree on.
 * @returns {Object} An object containing layoutedNodes and layoutedLinks.
 */
function getLayoutedElements(nodes, edges, rootId) {
  if (!nodes || nodes.length === 0) {
    return { layoutedNodes: [], layoutedLinks: [] };
  }

  // --- 1. Build Graph Representation ---
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [], parents: [], spouses: [] }]));
  const childToParentsMap = new Map();

  edges.forEach(edge => {
    const source = nodeMap.get(edge.from);
    const target = nodeMap.get(edge.to);
    if (!source || !target) return;

    if (edge.type === 'parent' || edge.type === 'child') {
      const parent = edge.type === 'parent' ? source : target;
      const child = edge.type === 'parent' ? target : source;
      if (!childToParentsMap.has(child.id)) {
        childToParentsMap.set(child.id, new Set());
      }
      childToParentsMap.get(child.id).add(parent.id);
    } else if (edge.type === 'spouse' || edge.type === 'ex-spouse') {
      source.spouses.push(target.id);
      target.spouses.push(source.id);
    }
  });

  // --- 2. Create Union Nodes for Couples ---
  const unionNodes = new Map();
  childToParentsMap.forEach((parentIds, childId) => {
    if (parentIds.size > 1) {
      const sortedParentIds = Array.from(parentIds).sort().join('_');
      if (!unionNodes.has(sortedParentIds)) {
        unionNodes.set(sortedParentIds, {
          id: `union-${sortedParentIds}`,
          isUnion: true,
          parentIds: Array.from(parentIds),
          children: [],
        });
      }
      unionNodes.get(sortedParentIds).children.push(childId);
    }
  });

  // --- 3. Assign Generations via BFS ---
  const generations = new Map();
  const queue = [];
  const visited = new Set();

  let startNodeId = rootId;
  if (!startNodeId) {
    // If no root is selected, find all progenitors (nodes with no parents)
    const progenitors = nodes.filter(n => !childToParentsMap.has(n.id));
    progenitors.forEach(p => {
      queue.push({ id: p.id, gen: 0 });
      visited.add(p.id);
    });
  } else {
    queue.push({ id: startNodeId, gen: 0 });
    visited.add(startNodeId);
  }
  
  while (queue.length > 0) {
    const { id, gen } = queue.shift();
    generations.set(id, gen);

    // Traverse to parents (up the tree)
    const parents = childToParentsMap.get(id);
    if (parents) {
      parents.forEach(parentId => {
        if (!visited.has(parentId)) {
          visited.add(parentId);
          queue.push({ id: parentId, gen: gen - 1 });
        }
      });
    }

    // Traverse to children (down the tree)
    const personNode = nodeMap.get(id);
    const unionsAsParent = Array.from(unionNodes.values()).filter(u => u.parentIds.includes(id));
    unionsAsParent.forEach(union => {
      union.children.forEach(childId => {
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push({ id: childId, gen: gen + 1 });
        }
      });
    });
     // Handle single-parent children
    const singleParentChildren = Array.from(childToParentsMap.entries())
        .filter(([, pIds]) => pIds.size === 1 && pIds.has(id))
        .map(([cId]) => cId);

    singleParentChildren.forEach(childId => {
        if (!visited.has(childId)) {
            visited.add(childId);
            queue.push({ id: childId, gen: gen + 1 });
        }
    });


    // Traverse to spouses (sideways)
    personNode.spouses.forEach(spouseId => {
      if (!visited.has(spouseId)) {
        visited.add(spouseId);
        generations.set(spouseId, gen); // Spouses are on the same generation
      }
    });
  }

  // --- 4. Group Nodes by Generation and Calculate Positions ---
  const nodesByGeneration = new Map();
  generations.forEach((gen, id) => {
    if (!nodesByGeneration.has(gen)) {
      nodesByGeneration.set(gen, []);
    }
    nodesByGeneration.get(gen).push(id);
  });

  // Sort generations so that the smallest (oldest) is at the top
  const sortedGenerations = Array.from(nodesByGeneration.keys()).sort((a, b) => a - b);
  const minGen = sortedGenerations[0];

  const layoutedNodes = [];
  sortedGenerations.forEach((gen) => {
    const ids = nodesByGeneration.get(gen);
    const y = (gen - minGen) * GENERATION_SPACING;
    const genWidth = ids.length * (NODE_WIDTH + SIBLING_SPACING);
    let x = -genWidth / 2;
    ids.forEach(id => {
      const node = nodeMap.get(id);
      if (node) {
        layoutedNodes.push({ ...node, x, y });
        x += NODE_WIDTH + SIBLING_SPACING;
      }
    });
  });

  const nodePosMap = new Map(layoutedNodes.map(n => [n.id, n]));

  // Add union nodes to the layout
  unionNodes.forEach(union => {
    const parentPositions = union.parentIds.map(id => nodePosMap.get(id)).filter(Boolean);
    if (parentPositions.length > 0) {
      const avgX = parentPositions.reduce((sum, p) => sum + p.x, 0) / parentPositions.length;
      const parentY = parentPositions[0].y;
      layoutedNodes.push({ ...union, x: avgX, y: parentY + (GENERATION_SPACING / 2) });
    }
  });
  const finalNodePosMap = new Map(layoutedNodes.map(n => [n.id, n]));

  // --- 5. Create Links ---
  const layoutedLinks = [];
  finalNodePosMap.forEach(node => {
    if (node.isUnion) {
      // Links from parents to union
      node.parentIds.forEach(parentId => {
        const parentNode = finalNodePosMap.get(parentId);
        if (parentNode) {
          layoutedLinks.push({ source: parentNode, target: node });
        }
      });
      // Links from union to children
      node.children.forEach(childId => {
        const childNode = finalNodePosMap.get(childId);
        if (childNode) {
          layoutedLinks.push({ source: node, target: childNode });
        }
      });
    } else {
        // Links for single parents
        const parents = childToParentsMap.get(node.id);
        if (parents && parents.size === 1) {
            const parentNode = finalNodePosMap.get(Array.from(parents)[0]);
            if (parentNode) {
                layoutedLinks.push({ source: parentNode, target: node });
            }
        }
    }
  });

  return { layoutedNodes, layoutedLinks };
}

const Tree = () => {
  // --- State Management (formerly in TreeStateContext) ---
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [layoutRootId, setLayoutRootId] = useState(null); // State for the centered person

  const { data, isLoading, isError } = useFullTree();

  const openAddPersonModal = () => setAddPersonModalOpen(true);
  const closeAddPersonModal = () => setAddPersonModalOpen(false);
  const openPersonCard = (person) => setSelectedPerson(person);
  const closePersonCard = () => setSelectedPerson(null);
  
  // --- Memoize Layout Calculation ---
  const { layoutedNodes, layoutedLinks } = useMemo(() => {
    if (data?.nodes && data?.edges) {
      return getLayoutedElements(data.nodes, data.edges, layoutRootId);
    }
    return { layoutedNodes: [], layoutedLinks: [] };
  }, [data, layoutRootId]);

  // --- Handlers ---
  const handleEditPerson = (person) => setEditPerson(person);
  const handleCloseEditModal = () => setEditPerson(null);
  const handleDeletePerson = (person) => {
    setDeleteTarget(person);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => { /* ... */ };
  const handleCancelDelete = () => setShowDeleteModal(false);
  const handleSetRoot = useCallback((id) => {
    setLayoutRootId(id);
    closePersonCard();
  }, [closePersonCard]);

  // --- Render States ---
  if (isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (isError) return <div className="flex items-center justify-center h-full text-red-500">Error loading tree.</div>;

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <Button onClick={openAddPersonModal} variant="primary" size="lg">+ Add Person</Button>
        {layoutRootId && (
          <Button onClick={() => setLayoutRootId(null)} variant="secondary" size="md">Reset View</Button>
        )}
      </div>
      <Zoom width={window.innerWidth} height={window.innerHeight}>
        {(zoom) => (
          <svg width="100%" height="100%" ref={zoom.containerRef} style={{ touchAction: 'none', transition: 'background 0.3s' }}>
            <g transform={zoom.toString()}>
              {/* Render links with hover effect */}
              {layoutedLinks.map((link, i) => (
                <LinkVertical key={`link-${i}`} data={link} stroke="#a7a9be" strokeWidth="2" fill="none" />
              ))}

              {/* Render nodes with shadow, hover, and animated transitions */}
              {layoutedNodes.map((node, i) => {
                if (node.isUnion) return null; // Don't render union nodes
                return (
                  <Group key={`node-${i}`} top={node.y} left={node.x}>
                    <foreignObject
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT + 50}
                      x={-NODE_WIDTH / 2}
                      y={-NODE_HEIGHT / 2}
                      className="overflow-visible"
                    >
                      <CustomNode
                        data={{
                          person: node,
                          onEdit: handleEditPerson,
                          onDelete: handleDeletePerson,
                          onPersonCardOpen: openPersonCard,
                          onSetAsRoot: handleSetRoot, // Pass the handler to the node
                        }}
                        id={node.id}
                        selected={selectedPerson?.id === node.id}
                      />
                    </foreignObject>
                  </Group>
                );
              })}
            </g>
          </svg>
        )}
      </Zoom>
      {/* PersonCard overlay */}
      {selectedPerson && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all">
          <PersonCard
            person={selectedPerson}
            onClose={closePersonCard}
            onEdit={handleEditPerson}
            onDelete={handleDeletePerson}
            fixed
          />
        </div>
      )}
      {isAddPersonModalOpen && <AddPersonModal onClose={closeAddPersonModal} />}
      {editPerson && <EditPersonModal person={editPerson} onClose={handleCloseEditModal} />}
      {showDeleteModal && deleteTarget && (
        <DeletePersonModal
          person={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Tree;
