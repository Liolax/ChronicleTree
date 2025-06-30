import React, { useEffect, useCallback, useRef, useState } from 'react';
import ReactFlow, {
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import ParentEdge from './edges/ParentEdge';
import ChildEdge from './edges/ChildEdge';
import { SmoothStepEdge, StraightEdge, BezierEdge } from 'reactflow';
import { useTreeState } from '../../context/TreeStateContext';
import { useFullTree, usePeople } from '../../services/people';
import Button from '../UI/Button';
import AddPersonModal from './modals/AddPersonModal';
import EditPersonModal from './modals/EditPersonModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import PersonCard from './PersonCard';

const nodeWidth = 172;
const nodeHeight = 60;

// Map your relationship types to edge components
const edgeTypes = {
  parent: ParentEdge,
  child: ChildEdge, // Now using the new ChildEdge
  spouse: SmoothStepEdge,
  sibling: StraightEdge,
  cousin: BezierEdge,
  grandparent: StraightEdge,
  default: StraightEdge,
};

const nodeTypes = {
  person: CustomNode,
};

function getLayoutedElements(nodes, edges, direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: nodeWithPosition
          ? {
              x: nodeWithPosition.x - nodeWidth / 2,
              y: nodeWithPosition.y - nodeHeight / 2,
            }
          : node.position || { x: 0, y: 0 },
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
      };
    }),
    edges,
  };
}

const Tree = () => {
  const { selectedPerson, openPersonCard, closePersonCard } = useTreeState();
  const { data, isLoading, isError } = useFullTree();
  const { openAddPersonModal, closeAddPersonModal, isAddPersonModalOpen } = useTreeState();
  const { data: people = [] } = usePeople();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [editPerson, setEditPerson] = useState(null);
  const [deletePerson, setDeletePerson] = useState(null);
  const reactFlowWrapper = useRef(null);
  const { fitView } = useReactFlow();

  // Handler to open edit modal
  const handleEditPerson = useCallback((person) => {
    setEditPerson(person);
  }, []);

  // Handler to close edit modal
  const handleCloseEditModal = useCallback(() => {
    setEditPerson(null);
  }, []);

  // Handler to open delete modal
  const handleDeletePerson = useCallback((person) => {
    setDeletePerson(person);
  }, []);

  // Handler to close delete modal
  const handleCloseDeleteModal = useCallback(() => {
    setDeletePerson(null);
  }, []);

  // Layout and fit view on mount or when nodes/edges change
  useEffect(() => {
    if (data && typeof data === 'object' && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
      // API returns { nodes: [...], edges: [...] }
      const apiNodes = data.nodes;
      const apiEdges = data.edges;
      // Convert backend format to React Flow format
      const rfNodes = apiNodes.map((n) => ({
        id: String(n.id),
        type: 'person',
        data: {
          person: n,
          onEdit: handleEditPerson,
          onDelete: handleDeletePerson,
          onPersonCardOpen: () => openPersonCard(n),
        },
        position: { x: 0, y: 0 }, // will be set by layout
      }));
      const rfEdges = apiEdges.map((e, i) => ({
        id: `${e.type}-${e.from}-${e.to}`,
        source: String(e.from),
        target: String(e.to),
        type: e.type,
      }));
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges, 'TB');
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setTimeout(() => fitView({ padding: 0.2, minZoom: 0.2, maxZoom: 1.5 }), 0);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [data, fitView, handleEditPerson, handleDeletePerson]);

  if (isLoading) return <div className="flex items-center justify-center h-full">Loading tree...</div>;
  if (isError) return <div className="flex items-center justify-center h-full text-red-600">Failed to load tree.</div>;
  if (!nodes.length) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
      <div>No tree data available.</div>
      <Button onClick={openAddPersonModal} variant="primary">Add Person</Button>
    </div>
  );

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Top-right Add Person Button */}
      <button
        onClick={openAddPersonModal}
        className="absolute top-6 right-8 z-50 bg-button-primary text-white rounded-full shadow-lg flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold hover:bg-button-primary-hover focus:outline-none focus:ring-2 focus:ring-button-primary"
        aria-label="Add Person"
        title="Add Person"
        type="button"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="hidden sm:inline">Add Person</span>
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        selectionOnDrag
        defaultEdgeOptions={{ type: 'default' }}
      >
        <Background gap={24} color="#eee" />
        <MiniMap nodeColor={() => '#4F868E'} />
        <Controls showInteractive={true} />
      </ReactFlow>
      {isAddPersonModalOpen && (
        <AddPersonModal
          key={`add-person-modal-${people.length}`}
          isOpen={isAddPersonModalOpen}
          onClose={closeAddPersonModal}
          people={people}
          isFirstPerson={people.length === 0}
        />
      )}
      {editPerson && (
        <EditPersonModal
          person={editPerson}
          isOpen={!!editPerson}
          onClose={handleCloseEditModal}
        />
      )}
      {deletePerson && (
        <ConfirmDeleteModal
          isOpen={!!deletePerson}
          onClose={handleCloseDeleteModal}
          person={deletePerson}
          confirmText={`Delete ${deletePerson.first_name} ${deletePerson.last_name}`}
          description={`Are you sure you want to delete ${deletePerson.first_name} ${deletePerson.last_name}? This action cannot be undone.`}
          confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        />
      )}
      {selectedPerson && (() => {
        // Find the node for the selected person
        const node = nodes.find(n => n.data && n.data.person && n.data.person.id === selectedPerson.id);
        // Get the position (center of node in ReactFlow coordinates)
        const position = node ? node.position : undefined;
        // Wrap edit/delete to close card first
        const handleEditAndClose = (person) => {
          closePersonCard();
          handleEditPerson(person);
        };
        const handleDeleteAndClose = (person) => {
          closePersonCard();
          handleDeletePerson(person);
        };
        return (
          <PersonCard
            person={selectedPerson}
            onClose={closePersonCard}
            onEdit={handleEditAndClose}
            onDelete={handleDeleteAndClose}
            position={position}
          />
        );
      })()}
    </div>
  );
};

export default Tree;
