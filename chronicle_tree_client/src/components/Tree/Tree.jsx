import React, { useState, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Button from "../UI/Button";
import AddPersonModal from "./modals/AddPersonModal";
import EditPersonModal from "./modals/EditPersonModal";
import DeletePersonModal from '../UI/DeletePersonModal';
import { useFullTree } from "../../services/people";
import CustomNode from './CustomNode';
import PersonCard from "./PersonCard";
import { familyTreeLayout } from '../../utils/familyTreeLayout';
import { dagreLayout } from '../../utils/dagreLayout';

// --- React Flow Node Types ---
const nodeTypes = {
  custom: CustomNode,
};

// --- Layout Types ---
const LAYOUT_TYPES = {
  ENHANCED: 'enhanced',
  DAGRE: 'dagre',
};

// --- Legacy Layout Function (kept for fallback) ---
// This is the original buildFlowElements function, kept as a fallback
function buildFlowElementsLegacy(nodes, edges, handlers = {}) {
  if (!nodes || !edges) return { flowNodes: [], flowEdges: [] };

  // --- Map backend edge keys {from,to} to {source,target} for React Flow ---
  const normalizedEdges = edges.map(e => {
    if (e.from !== undefined && e.to !== undefined) {
      return { ...e, source: e.from, target: e.to };
    }
    return e;
  });

  // --- Filter out edges with missing/invalid source or target ---
  const nodeIds = new Set(nodes.map(n => String(n.id)));
  const validEdges = normalizedEdges.filter(e => {
    return (
      e.source !== undefined &&
      e.target !== undefined &&
      nodeIds.has(String(e.source)) &&
      nodeIds.has(String(e.target))
    );
  });

  // --- GENERATIONAL LAYOUT: Compute generation for each person ---
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const childToParents = {};
  const parentToChildren = {};
  validEdges.forEach(e => {
    if (e.type === 'parent' || e.type === 'child') {
      const parentId = e.type === 'parent' ? e.source : e.target;
      const childId = e.type === 'parent' ? e.target : e.source;
      if (!childToParents[childId]) childToParents[childId] = [];
      if (!parentToChildren[parentId]) parentToChildren[parentId] = [];
      childToParents[childId].push(parentId);
      parentToChildren[parentId].push(childId);
    }
  });
  const rootIds = nodes.filter(n => !childToParents[n.id] || childToParents[n.id].length === 0).map(n => n.id);
  const generationMap = {};
  const visited = new Set();
  let queue = rootIds.map(id => ({ id, gen: 0 }));
  while (queue.length > 0) {
    const { id, gen } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    generationMap[id] = gen;
    (parentToChildren[id] || []).forEach(childId => {
      queue.push({ id: childId, gen: gen + 1 });
    });
  }
  const genGroups = {};
  nodes.forEach(n => {
    const g = generationMap[n.id] ?? 0;
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(n);
  });

  // --- COUPLE GROUPING: Place couples together horizontally ---
  const spouseEdges = validEdges.filter(e => e.type === 'spouse');
  const coupleGroups = [];
  const coupled = new Set();
  spouseEdges.forEach(e => {
    const a = String(e.source), b = String(e.target);
    if (!coupled.has(a) && !coupled.has(b)) {
      coupleGroups.push([a, b]);
      coupled.add(a); coupled.add(b);
    }
  });
  const nodeToCoupleIdx = {};
  coupleGroups.forEach((group, idx) => {
    group.forEach(id => { nodeToCoupleIdx[id] = idx; });
  });

  // 6. Place nodes: each generation is a row, couples grouped, singles spaced
  const flowNodes = [];
  const xSpacing = 300, ySpacing = 250;
  Object.entries(genGroups).forEach(([gen, group]) => {
    const couples = [], singles = [];
    group.forEach(n => {
      if (nodeToCoupleIdx[n.id] !== undefined) {
        if (!couples[nodeToCoupleIdx[n.id]]) couples[nodeToCoupleIdx[n.id]] = [];
        couples[nodeToCoupleIdx[n.id]].push(n);
      } else {
        singles.push(n);
      }
    });
    let x = 0;
    couples.forEach(pair => {
      pair.forEach((n, i) => {
        flowNodes.push({
          id: String(n.id),
          type: 'custom',
          data: { person: n, ...handlers },
          position: { x: x + i * 120, y: gen * ySpacing },
          draggable: true,
        });
      });
      x += 240;
    });
    singles.forEach(n => {
      flowNodes.push({
        id: String(n.id),
        type: 'custom',
        data: { person: n, ...handlers },
        position: { x, y: gen * ySpacing },
        draggable: true,
      });
      x += xSpacing;
    });
  });
  const idToNode = Object.fromEntries(flowNodes.map(n => [n.id, n]));
  flowNodes.forEach(n => {
    const parents = (childToParents[n.id] || []).map(pid => idToNode[pid]).filter(Boolean);
    if (parents.length > 1) {
      const avgX = parents.reduce((sum, p) => sum + p.position.x, 0) / parents.length;
      n.position.x = avgX;
    }
  });

  const edgeCount = {};
  validEdges.forEach(e => {
    const key = `${e.source}-${e.target}`;
    edgeCount[key] = (edgeCount[key] || 0) + 1;
  });
  const flowEdges = validEdges.map((e, i) => {
    const key = `${e.source}-${e.target}`;
    const count = edgeCount[key];
    let label = e.type;
    let style = {
      stroke: e.type === 'spouse' ? '#f59e42' : '#6366f1',
      strokeWidth: 2,
    };
    if (count > 1) {
      style = { ...style, strokeDasharray: '4 2' };
      label += ` (${count})`;
    }
    return {
      id: `e${e.source}-${e.target}`,
      source: String(e.source),
      target: String(e.target),
      type: 'smoothstep',
      animated: false,
      style,
      label,
    };
  });
  return { flowNodes, flowEdges };
}

// --- Enhanced Layout Function ---
function buildFlowElements(nodes, edges, handlers = {}, layoutType = LAYOUT_TYPES.ENHANCED) {
  if (!nodes || !edges) return { flowNodes: [], flowEdges: [] };

  // Normalize edges to ensure consistent source/target properties
  const normalizedEdges = edges.map(e => {
    if (e.from !== undefined && e.to !== undefined) {
      return { ...e, source: e.from, target: e.to };
    }
    return e;
  });

  try {
    // Use the selected layout algorithm
    switch (layoutType) {
      case LAYOUT_TYPES.ENHANCED:
        return familyTreeLayout(nodes, normalizedEdges, handlers);
      case LAYOUT_TYPES.DAGRE:
        return dagreLayout(nodes, normalizedEdges, handlers);
      default:
        return buildFlowElementsLegacy(nodes, normalizedEdges, handlers);
    }
  } catch (error) {
    console.error('Layout error, falling back to legacy layout:', error);
    return buildFlowElementsLegacy(nodes, normalizedEdges, handlers);
  }
}

const FamilyTree = () => {
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [personCardPosition, setPersonCardPosition] = useState(null);
  const [layoutType, setLayoutType] = useState(LAYOUT_TYPES.ENHANCED);
  const { data, isLoading, isError } = useFullTree();

  // --- Handlers must be defined before useMemo below ---
  const reactFlowInstance = React.useRef(null);

  const handleEditPerson = (person) => setEditPerson(person);
  const handleCloseEditModal = () => setEditPerson(null);
  const openAddPersonModal = () => setAddPersonModalOpen(true);
  const closeAddPersonModal = () => setAddPersonModalOpen(false);
  const openPersonCard = (person, event) => {
    setSelectedPerson(person);
    if (event) {
      setPersonCardPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const closePersonCard = () => {
    setSelectedPerson(null);
    setPersonCardPosition(null);
  };
  // Center the tree on a person node
  const handleCenterPerson = (personId) => {
    if (!reactFlowInstance.current) return;
    const node = nodes.find(n => n.id === String(personId));
    if (node) {
      reactFlowInstance.current.setCenter(node.position.x + 85, node.position.y + 60, { zoom: 1.1, duration: 600 });
    }
  };

  // React Flow state
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!data) return { flowNodes: [], flowEdges: [] };
    // Pass handlers for detailed CustomNode
    return buildFlowElements(data.nodes, data.edges, {
      onEdit: handleEditPerson,
      onDelete: person => setDeleteTarget(person),
      onPersonCardOpen: openPersonCard,
      onCenter: handleCenterPerson,
    }, layoutType);
  }, [data, layoutType]);
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // --- Keep nodes/edges in sync with API data ---
  React.useEffect(() => {
    setNodes(flowNodes);
  }, [setNodes, flowNodes]);
  React.useEffect(() => {
    setEdges(flowEdges);
  }, [setEdges, flowEdges]);

  // --- Render ---
  // FitViewButton must be a child of ReactFlow to use useReactFlow
  function FitViewButton() {
    const reactFlowInstance = useReactFlow();
    const handleFitView = () => {
      if (reactFlowInstance && reactFlowInstance.fitView) {
        reactFlowInstance.fitView();
      }
    };
    return <Button onClick={handleFitView}>Re-center Tree</Button>;
  }

  // --- Render ---
  return (
    <ReactFlowProvider>
      <div className="w-full h-[80vh] relative">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <Button onClick={openAddPersonModal}>Add Person</Button>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Layout:</label>
              <select
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value={LAYOUT_TYPES.ENHANCED}>Enhanced Family Tree</option>
                <option value={LAYOUT_TYPES.DAGRE}>Automatic (Dagre)</option>
              </select>
            </div>
          </div>
          <FitViewButton />
        </div>
        {/* Debug panel for data status */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20, background: '#fff', padding: 8, borderRadius: 4, boxShadow: '0 2px 8px #0001', fontSize: 12 }}>
          <div><b>Debug:</b></div>
          <div>Loading: {String(isLoading)}</div>
          <div>Error: {String(isError)}</div>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
          <div>Layout: {layoutType}</div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          onNodeClick={(_evt, node) => {
            // Get bounding rect of node DOM element
            const nodeElement = document.querySelector(`[data-id='${node.id}']`);
            let position = undefined;
            if (nodeElement) {
              const rect = nodeElement.getBoundingClientRect();
              position = { x: rect.right + 10, y: rect.top + window.scrollY };
            }
            setSelectedPerson(node.data.person);
            setPersonCardPosition(position);
          }}
          onConnect={params => setEdges(eds => [...eds, { ...params, type: 'smoothstep', style: { stroke: '#6366f1', strokeWidth: 2 } }])}
          ref={reactFlowInstance}
        >
          <Background gap={16} color="#e5e7eb" />
          <MiniMap nodeColor={n => n.data?.person?.gender?.toLowerCase() === 'female' ? '#f472b6' : '#60a5fa'} />
          <Controls />
        </ReactFlow>
        {selectedPerson && (
          <PersonCard
            person={selectedPerson}
            onEdit={handleEditPerson}
            onDelete={() => setDeleteTarget(selectedPerson)}
            onClose={closePersonCard}
            position={personCardPosition}
            fixed={!!personCardPosition}
          />
        )}
        {isAddPersonModalOpen && (
          <AddPersonModal isOpen={isAddPersonModalOpen} onClose={closeAddPersonModal} />
        )}
        {editPerson && (
          <EditPersonModal person={editPerson} isOpen={!!editPerson} onClose={handleCloseEditModal} />
        )}
        {deleteTarget && (
          <DeletePersonModal person={deleteTarget} onConfirm={() => {}} onCancel={() => setDeleteTarget(null)} isLoading={isDeleting} />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTree;
