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
import { createFamilyTreeLayout, centerTree } from "../../utils/familyTreeLayout";
import { createDagreBasedLayout, postProcessDagreLayout } from "../../utils/dagreLayout";

// --- React Flow Node Types ---
const nodeTypes = {
  custom: CustomNode,
};

// --- Helper: Transform API data to React Flow nodes/edges using improved layout ---
function buildFlowElements(nodes, edges, handlers = {}, algorithm = 'enhanced') {
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

  // Choose layout algorithm
  let result;
  if (algorithm === 'dagre') {
    result = createDagreBasedLayout(nodes, validEdges, handlers);
    result = postProcessDagreLayout(result.flowNodes, result.flowEdges);
  } else {
    result = createFamilyTreeLayout(nodes, validEdges, handlers);
  }

  return result;
}

const FamilyTree = () => {
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [personCardPosition, setPersonCardPosition] = useState(null);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState('enhanced'); // 'enhanced' or 'dagre'
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
  
  // Auto-center and fit the entire tree
  const handleFitAndCenterTree = () => {
    if (!reactFlowInstance.current) return;
    
    setTimeout(() => {
      const centeredNodes = centerTree(nodes, 1200, 800); // Approximate viewport size
      setNodes(centeredNodes);
      
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.1, duration: 800 });
      }, 100);
    }, 100);
  };

  // React Flow state
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!data) return { flowNodes: [], flowEdges: [] };
    // Pass handlers for detailed CustomNode
    const handlers = {
      onEdit: handleEditPerson,
      onDelete: person => setDeleteTarget(person),
      onPersonCardOpen: openPersonCard,
      onCenter: handleCenterPerson,
    };
    return buildFlowElements(data.nodes, data.edges, handlers, layoutAlgorithm);
  }, [data, layoutAlgorithm]);
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // --- Keep nodes/edges in sync with API data ---
  React.useEffect(() => {
    setNodes(flowNodes);
    // Auto-center tree when data changes
    if (flowNodes.length > 0) {
      setTimeout(() => handleFitAndCenterTree(), 200);
    }
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
        reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
      }
    };
    return (
      <div className="flex gap-2">
        <Button onClick={handleFitView}>Fit View</Button>
        <Button onClick={handleFitAndCenterTree}>Center Tree</Button>
      </div>
    );
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
                value={layoutAlgorithm} 
                onChange={(e) => setLayoutAlgorithm(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="enhanced">Enhanced Family Tree</option>
                <option value="dagre">Automatic (Dagre)</option>
              </select>
            </div>
          </div>
        </div>
        {/* Debug panel for data status */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20, background: '#fff', padding: 8, borderRadius: 4, boxShadow: '0 2px 8px #0001', fontSize: 12 }}>
          <div><b>Debug:</b></div>
          <div>Loading: {String(isLoading)}</div>
          <div>Error: {String(isError)}</div>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
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
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            <FitViewButton />
          </div>
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
