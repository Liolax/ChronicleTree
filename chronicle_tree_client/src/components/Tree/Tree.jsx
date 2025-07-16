import React, { useState, useMemo, useCallback } from "react";
import { Zoom } from "@visx/zoom";
import { Tree, hierarchy } from "@visx/hierarchy";
import { LinkHorizontal } from '@visx/shape';
import Button from "../UI/Button";
import AddPersonModal from "./modals/AddPersonModal";
import EditPersonModal from "./modals/EditPersonModal";
import DeletePersonModal from '../UI/DeletePersonModal';
import { useFullTree } from "../../services/people";
import clsx from 'clsx';
import CustomNode from './CustomNode'; // Import CustomNode component
import PersonCard from "./PersonCard";

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
  const parentToChildrenMap = new Map();

  edges.forEach(edge => {
    const source = nodeMap.get(edge.from);
    const target = nodeMap.get(edge.to);
    if (!source || !target) return;

    if (edge.type === 'parent' || edge.type === 'child') {
      const parent = edge.type === 'parent' ? source : target;
      const child = edge.type === 'parent' ? target : source;
      if (!childToParentsMap.has(child.id)) childToParentsMap.set(child.id, new Set());
      if (!parentToChildrenMap.has(parent.id)) parentToChildrenMap.set(parent.id, new Set());
      childToParentsMap.get(child.id).add(parent.id);
      parentToChildrenMap.get(parent.id).add(child.id);
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

  // --- 3. Assign Generations: root at 0, ancestors negative, descendants positive ---
  const generations = new Map();
  const queue = [];
  const visited = new Set();

  // If rootId is provided, start from there; otherwise, use oldest ancestors
  let roots = [];
  if (rootId && nodeMap.has(rootId)) {
    roots = [nodeMap.get(rootId)];
    queue.push({ id: rootId, gen: 0 });
    visited.add(rootId);
  } else {
    // Find all oldest ancestors (no parents)
    roots = nodes.filter(n => !childToParentsMap.has(n.id));
    roots.forEach(a => {
      queue.push({ id: a.id, gen: 0 });
      visited.add(a.id);
    });
  }

  // Traverse both up (ancestors) and down (descendants) from root
  while (queue.length > 0) {
    const { id, gen } = queue.shift();
    generations.set(id, gen);
    const personNode = nodeMap.get(id);

    // Traverse to parents (ancestors, gen-1)
    const parents = childToParentsMap.get(id);
    if (parents) {
      parents.forEach(parentId => {
        if (!visited.has(parentId)) {
          queue.push({ id: parentId, gen: gen - 1 });
          visited.add(parentId);
        }
      });
    }
    // Traverse to children (descendants, gen+1)
    const children = parentToChildrenMap.get(id);
    if (children) {
      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ id: childId, gen: gen + 1 });
          visited.add(childId);
        }
      });
    }
    // Traverse to spouses (same generation)
    personNode.spouses.forEach(spouseId => {
      if (!visited.has(spouseId)) {
        queue.push({ id: spouseId, gen });
        visited.add(spouseId);
      }
    });
  }

  // --- 4. Group Nodes by Generation and Calculate Positions ---
  const nodesByGeneration = new Map();
  generations.forEach((gen, id) => {
    if (!nodesByGeneration.has(gen)) nodesByGeneration.set(gen, []);
    nodesByGeneration.get(gen).push(id);
  });

  const sortedGenerations = Array.from(nodesByGeneration.keys()).sort((a, b) => a - b);
  const minGen = sortedGenerations[0];
  const maxGen = sortedGenerations[sortedGenerations.length - 1];

  // Center the root node horizontally
  const centerX = 0;
  const layoutedNodes = [];
  const finalNodePosMap = new Map();
  const renderedNodeIds = new Set();

  // Calculate y offset so that root is always at the same vertical position
  let rootGen = 0;
  if (rootId && generations.has(rootId)) rootGen = generations.get(rootId);
  const yOffset = -rootGen * GENERATION_SPACING;

  sortedGenerations.forEach(gen => {
    let idsInGen = nodesByGeneration.get(gen);
    let currentX = centerX - ((idsInGen.length - 1) * (NODE_WIDTH + SIBLING_SPACING)) / 2;

    // Group by families (spouses together)
    const familyGroups = [];
    const usedInGroup = new Set();
    idsInGen.forEach(personId => {
      if (usedInGroup.has(personId)) return;
      const person = nodeMap.get(personId);
      const group = [personId];
      usedInGroup.add(personId);
      Array.from(person.spouses).forEach(spouseId => {
        if (idsInGen.includes(spouseId) && !usedInGroup.has(spouseId)) {
          group.push(spouseId);
          usedInGroup.add(spouseId);
        }
      });
      familyGroups.push(group);
    });

    // Sort groups by birth year, then name
    familyGroups.sort((a, b) => {
      const personA = nodeMap.get(a[0]);
      const personB = nodeMap.get(b[0]);
      const birthYearA = personA.date_of_birth ? new Date(personA.date_of_birth).getFullYear() : Infinity;
      const birthYearB = personB.date_of_birth ? new Date(personB.date_of_birth).getFullYear() : Infinity;
      if (birthYearA !== birthYearB) return birthYearA - birthYearB;
      return (personA.first_name || '').localeCompare(personB.first_name || '');
    });

    familyGroups.forEach(group => {
      group.sort((aId, bId) => {
        const personA = nodeMap.get(aId);
        const personB = nodeMap.get(bId);
        const birthYearA = personA.date_of_birth ? new Date(personA.date_of_birth).getFullYear() : Infinity;
        const birthYearB = personB.date_of_birth ? new Date(personB.date_of_birth).getFullYear() : Infinity;
        if (birthYearA !== birthYearB) return birthYearA - birthYearB;
        return (personA.first_name || '').localeCompare(personB.first_name || '');
      });
      const groupWidth = group.length * (NODE_WIDTH + SIBLING_SPACING) - SIBLING_SPACING;
      let groupX = currentX + groupWidth / 2 - NODE_WIDTH / 2;
      group.forEach(id => {
        if (renderedNodeIds.has(id)) return;
        const node = nodeMap.get(id);
        if (node) {
          const y = gen * GENERATION_SPACING + yOffset;
          layoutedNodes.push({ ...node, x: groupX, y: y, _key: `node-${node.id}-gen${gen}` });
          finalNodePosMap.set(node.id, { ...node, x: groupX, y: y });
          renderedNodeIds.add(id);
          groupX += NODE_WIDTH + SIBLING_SPACING;
        }
      });
      currentX += groupWidth + SIBLING_SPACING * 2;
    });
  });

  // Add union nodes to the layout
  unionNodes.forEach(union => {
    if (renderedNodeIds.has(union.id)) return;
    const parentPositions = union.parentIds.map(id => finalNodePosMap.get(id)).filter(Boolean);
    if (parentPositions.length > 0) {
      const avgX = parentPositions.reduce((sum, p) => sum + p.x, 0) / parentPositions.length;
      const parentY = parentPositions[0].y;
      layoutedNodes.push({ ...union, x: avgX, y: parentY + (GENERATION_SPACING / 2) });
      finalNodePosMap.set(union.id, { ...union, x: avgX, y: parentY + (GENERATION_SPACING / 2) });
      renderedNodeIds.add(union.id);
    }
  });

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
      // Spouse links (draw only once per pair)
      if (node.spouses && node.spouses.length > 0) {
        node.spouses.forEach(spouseId => {
          if (finalNodePosMap.has(spouseId) && node.id < spouseId) {
            layoutedLinks.push({ source: node, target: finalNodePosMap.get(spouseId), isSpouse: true });
          }
        });
      }
    }
  });

  return { layoutedNodes, layoutedLinks };
}

// --- Helper: Convert flat nodes/edges to nested tree for d3-hierarchy ---
function buildNestedTree(nodes, edges, rootId) {
  if (!nodes || nodes.length === 0) return null;
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [] }]));
  // Build parent->children relationships
  edges.forEach(edge => {
    if (edge.type === 'parent' || edge.type === 'child') {
      const parentId = edge.type === 'parent' ? edge.from : edge.to;
      const childId = edge.type === 'parent' ? edge.to : edge.from;
      const parent = nodeMap.get(parentId);
      const child = nodeMap.get(childId);
      if (parent && child && !parent.children.some(c => c.id === child.id)) {
        parent.children.push(child);
      }
    }
  });
  // Find root node
  let rootNode = null;
  if (rootId && nodeMap.has(rootId)) {
    rootNode = nodeMap.get(rootId);
  } else {
    // Find a node with no parents
    const childIds = new Set();
    edges.forEach(edge => {
      if (edge.type === 'parent' || edge.type === 'child') {
        const childId = edge.type === 'parent' ? edge.to : edge.from;
        childIds.add(childId);
      }
    });
    rootNode = nodes.find(n => !childIds.has(n.id)) || nodes[0];
    rootNode = nodeMap.get(rootNode.id);
  }
  return rootNode;
}

/**
 * Build a merged tree for a person: ancestors above, descendants below.
 * Returns a structure suitable for custom rendering (not d3-hierarchy).
 */
function buildBidirectionalTree(nodes, edges, rootId) {
  if (!nodes || nodes.length === 0 || !rootId) return null;
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [], parents: [] }]));
  const childToParents = new Map();
  const parentToChildren = new Map();
  edges.forEach(edge => {
    if (edge.type === 'parent' || edge.type === 'child') {
      const parentId = edge.type === 'parent' ? edge.from : edge.to;
      const childId = edge.type === 'parent' ? edge.to : edge.from;
      if (!childToParents.has(childId)) childToParents.set(childId, new Set());
      if (!parentToChildren.has(parentId)) parentToChildren.set(parentId, new Set());
      childToParents.get(childId).add(parentId);
      parentToChildren.get(parentId).add(childId);
    }
  });
  // Recursively collect ancestors
  function collectAncestors(id, visited = new Set()) {
    if (visited.has(id)) return null;
    visited.add(id);
    const node = nodeMap.get(id);
    const parents = Array.from(childToParents.get(id) || []);
    node.parents = parents.map(pid => collectAncestors(pid, visited)).filter(Boolean);
    return node;
  }
  // Recursively collect descendants
  function collectDescendants(id, visited = new Set()) {
    if (visited.has(id)) return null;
    visited.add(id);
    const node = nodeMap.get(id);
    const children = Array.from(parentToChildren.get(id) || []);
    node.children = children.map(cid => collectDescendants(cid, visited)).filter(Boolean);
    return node;
  }
  // Build ancestor and descendant trees
  const root = nodeMap.get(rootId);
  const ancestorTree = collectAncestors(rootId, new Set([rootId]));
  const descendantTree = collectDescendants(rootId, new Set([rootId]));
  // Merge: root node, with .parents and .children
  return {
    ...root,
    parents: ancestorTree ? ancestorTree.parents : [],
    children: descendantTree ? descendantTree.children : [],
  };
}

// --- Recursive render for bidirectional tree (ancestors above, descendants below) ---
function renderBidirectionalTree(node, x, y, level, direction, parentPos, renderLinks, renderNodes, visited = new Set()) {
  if (!node || visited.has(node.id)) return null;
  visited.add(node.id);
  const NODE_V = 200; // vertical spacing
  const NODE_H = 220; // horizontal spacing

  // Render spouses (same generation, horizontally)
  let spouseNodes = [];
  let spouseLinks = [];
  if (node.spouses && node.spouses.length > 0) {
    const n = node.spouses.length + 1;
    const idx = 0; // current node is always at center
    node.spouses.forEach((spouse, i) => {
      if (!visited.has(spouse.id)) {
        const sx = x - ((n - 1) * NODE_H) / 2 + (i + (i >= idx ? 1 : 0)) * NODE_H;
        spouseNodes.push(renderBidirectionalTree(spouse, sx, y, level, 'spouse', { x, y }, renderLinks, renderNodes, visited));
        spouseLinks.push(renderLinks(node, { x, y }, spouse, { x: sx, y: y }, 'spouse'));
      }
    });
  }

  // Render siblings (same generation, horizontally, but not spouses)
  let siblingNodes = [];
  let siblingLinks = [];
  if (node.siblings && node.siblings.length > 0) {
    const n = node.siblings.length + 1;
    const idx = 0; // current node is always at center
    node.siblings.forEach((sibling, i) => {
      if (!visited.has(sibling.id)) {
        const sibx = x - ((n - 1) * NODE_H) / 2 + (i + (i >= idx ? 1 : 0)) * NODE_H;
        siblingNodes.push(renderBidirectionalTree(sibling, sibx, y, level, 'sibling', { x, y }, renderLinks, renderNodes, visited));
        siblingLinks.push(renderLinks(node, { x, y }, sibling, { x: sibx, y: y }, 'sibling'));
      }
    });
  }

  // Render ancestors above
  let ancestorNodes = [];
  let ancestorLinks = [];
  if (node.parents && node.parents.length > 0) {
    const n = node.parents.length;
    node.parents.forEach((parent, i) => {
      const px = x - ((n - 1) * NODE_H) / 2 + i * NODE_H;
      ancestorNodes.push(renderBidirectionalTree(parent, px, y - NODE_V, level - 1, 'up', { x, y }, renderLinks, renderNodes, visited));
      ancestorLinks.push(renderLinks(parent, { x: px, y: y - NODE_V }, node, { x, y }, 'parent'));
    });
  }
  // Render descendants below
  let descendantNodes = [];
  let descendantLinks = [];
  if (node.children && node.children.length > 0) {
    const n = node.children.length;
    node.children.forEach((child, i) => {
      const cx = x - ((n - 1) * NODE_H) / 2 + i * NODE_H;
      descendantNodes.push(renderBidirectionalTree(child, cx, y + NODE_V, level + 1, 'down', { x, y }, renderLinks, renderNodes, visited));
      descendantLinks.push(renderLinks(node, { x, y }, child, { x: cx, y: y + NODE_V }, 'child'));
    });
  }
  // Render this node
  const nodeElem = renderNodes(node, { x, y }, parentPos, level, direction);
  return (
    <g key={node.id}>
      {ancestorNodes}
      {ancestorLinks}
      {spouseNodes}
      {spouseLinks}
      {siblingNodes}
      {siblingLinks}
      {nodeElem}
      {descendantLinks}
      {descendantNodes}
    </g>
  );
}

const FamilyTree = () => {
  // --- State Management (formerly in TreeStateContext) ---
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [layoutRootId, setLayoutRootId] = useState(null); // State for the centered person
  const [personCardPosition, setPersonCardPosition] = useState(null);

  const { data, isLoading, isError } = useFullTree();

  const openAddPersonModal = () => setAddPersonModalOpen(true);
  const closeAddPersonModal = () => setAddPersonModalOpen(false);
  const openPersonCard = (person, event) => {
    if (event && event.target) {
      // Get bounding rect of the clicked node
      const rect = event.target.getBoundingClientRect();
      setPersonCardPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    } else {
      setPersonCardPosition(null); // fallback to center
    }
    setSelectedPerson(person);
  };
  const closePersonCard = () => {
    setSelectedPerson(null);
    setPersonCardPosition(null);
  };
  
  // --- Memoize Layout Calculation ---
  const { layoutedNodes, layoutedLinks } = useMemo(() => {
    if (data?.nodes && data?.edges) {
      return getLayoutedElements(data.nodes, data.edges, layoutRootId);
    }
    return { layoutedNodes: [], layoutedLinks: [] };
  }, [data, layoutRootId]);

  // --- Memoize Hierarchy for visx/d3-hierarchy ---
  const treeRoot = useMemo(() => {
    if (data?.nodes && data?.edges) {
      const nested = buildNestedTree(data.nodes, data.edges, layoutRootId);
      if (nested) return hierarchy(nested);
    }
    return null;
  }, [data, layoutRootId]);

  // --- Memoize Bidirectional Tree for custom rendering ---
  const mergedTree = useMemo(() => {
    if (data?.nodes && data?.edges && layoutRootId) {
      return buildBidirectionalTree(data.nodes, data.edges, layoutRootId);
    }
    return null;
  }, [data, layoutRootId]);

  // --- Handlers ---
  const handleEditPerson = (person) => {
    closePersonCard();
    setEditPerson(person);
  };
  const handleCloseEditModal = () => setEditPerson(null);
  const handleDeletePerson = (person) => {
    closePersonCard();
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

  // --- visx Tree Layout ---
  const width = window.innerWidth;
  const height = window.innerHeight;
  const margin = { top: 80, left: 80, right: 80, bottom: 80 };
  const centerX = width / 2;
  const centerY = height / 2;
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <Button onClick={openAddPersonModal} variant="primary" size="lg">+ Add Person</Button>
        {layoutRootId && (
          <Button onClick={() => setLayoutRootId(null)} variant="secondary" size="md">Reset View</Button>
        )}
      </div>
      <Zoom width={width} height={height}>
        {(zoom) => (
          <svg width="100%" height="100%" ref={zoom.containerRef} style={{ touchAction: 'none', transition: 'background 0.3s' }}>
            <g transform={zoom.toString()}>
              {layoutRootId && mergedTree ? (
                // Custom recursive render for centered view
                renderBidirectionalTree(
                  mergedTree,
                  centerX,
                  centerY,
                  0,
                  'center',
                  null,
                  (from, fromPos, to, toPos) => (
                    <line
                      key={`link-${from.id}-${to.id}`}
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={toPos.x}
                      y2={toPos.y}
                      stroke="#a7a9be"
                      strokeWidth={2}
                    />
                  ),
                  (person, pos, parentPos, level, direction) => (
                    <foreignObject
                      key={person.id}
                      x={pos.x - NODE_WIDTH / 2}
                      y={pos.y - NODE_HEIGHT / 2}
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      style={{ overflow: 'visible', pointerEvents: 'auto' }}
                      requiredExtensions="http://www.w3.org/1999/xhtml"
                    >
                      <div
                        style={{ width: NODE_WIDTH, height: NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}
                        tabIndex={0}
                        onClick={e => openPersonCard(person, e)}
                        role="button"
                        aria-label={`Open person card for ${person.first_name || ''} ${person.last_name || ''}`}
                      >
                        <CustomNode
                          data={{
                            person,
                            onEdit: handleEditPerson,
                            onDelete: handleDeletePerson,
                            onCenter: handleSetRoot,
                            onPersonCardOpen: openPersonCard
                          }}
                          id={person.id}
                          selected={selectedPerson && selectedPerson.id === person.id}
                        />
                      </div>
                    </foreignObject>
                  )
                )
              ) : (
                treeRoot && (
                  <Tree root={treeRoot} size={[yMax, xMax]}>
                    {tree => (
                      <g transform={`translate(${margin.left},${margin.top})`}>
                        {/* Render links */}
                        {tree.links().map((link, i) => (
                          <LinkHorizontal key={`link-${i}`} data={link} stroke="#a7a9be" strokeWidth={2} fill="none" />
                        ))}
                        {/* Render nodes */}
                        {tree.descendants().map((node, i) => (
                          <foreignObject
                            key={node.data.id || i}
                            x={node.y - NODE_WIDTH / 2}
                            y={node.x - NODE_HEIGHT / 2}
                            width={NODE_WIDTH}
                            height={NODE_HEIGHT}
                            style={{ overflow: 'visible', pointerEvents: 'auto' }}
                            requiredExtensions="http://www.w3.org/1999/xhtml"
                          >
                            <div
                              style={{ width: NODE_WIDTH, height: NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}
                              tabIndex={0}
                              onClick={e => openPersonCard(node.data, e)}
                              role="button"
                              aria-label={`Open person card for ${node.data.first_name || ''} ${node.data.last_name || ''}`}
                            >
                              <CustomNode
                                data={{
                                  person: node.data,
                                  onEdit: handleEditPerson,
                                  onDelete: handleDeletePerson,
                                  onCenter: handleSetRoot,
                                  onPersonCardOpen: openPersonCard
                                }}
                                id={node.data.id}
                                selected={selectedPerson && selectedPerson.id === node.data.id}
                              />
                            </div>
                          </foreignObject>
                        ))}
                      </g>
                    )}
                  </Tree>
                )
              )}
            </g>
          </svg>
        )}
      </Zoom>

      {/* --- PersonCard overlay/modal --- */}
      {selectedPerson && (
        <PersonCard
          person={selectedPerson}
          onClose={closePersonCard}
          onEdit={handleEditPerson}
          onDelete={handleDeletePerson}
          fixed={!!personCardPosition}
          position={personCardPosition}
        />
      )}

      {/* --- Modals --- */}
      {isAddPersonModalOpen && <AddPersonModal onClose={closeAddPersonModal} />}
      {editPerson && <EditPersonModal person={editPerson} onClose={handleCloseEditModal} />}
      {showDeleteModal && deleteTarget && (
        <DeletePersonModal
          person={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isOpen={showDeleteModal}
          setIsOpen={setShowDeleteModal}
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
        />
      )}

      {/* --- Debug Info --- */}
      {/* <div className="absolute top-0 right-0 p-4 text-xs bg-white bg-opacity-80 rounded-bl-lg">
        <pre>{JSON.stringify({ layoutedNodes, layoutedLinks }, null, 2)}</pre>
      </div> */}
    </div>
  );
};

export default FamilyTree;
