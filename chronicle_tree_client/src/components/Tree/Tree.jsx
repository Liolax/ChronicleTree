import React, { useEffect, useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactFlow, {
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import * as d3 from 'd3-hierarchy';
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

// D3-based family tree layout
function getD3LayoutedElements(nodes, edges, direction = 'TB') {
  // Build a map of nodes by id
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  // Build a map of children for each node
  const childrenMap = {};
  edges.forEach(e => {
    if (e.type === 'parent' || e.type === 'child') {
      // parent: source=parent, target=child
      const parentId = e.source;
      const childId = e.target;
      if (!childrenMap[parentId]) childrenMap[parentId] = [];
      childrenMap[parentId].push(childId);
    }
  });
  // Find root nodes (no incoming parent edge)
  const childIds = new Set(edges.filter(e => e.type === 'parent' || e.type === 'child').map(e => e.target));
  let rootNodes = nodes.filter(n => !childIds.has(n.id));
  console.log('Root nodes for D3 layout:', rootNodes);
  // If no root, pick the oldest person as root
  if (!rootNodes.length && nodes.length) {
    // Try to find the node with the earliest date_of_birth
    const nodesWithDOB = nodes.filter(n => n.data && n.data.person && n.data.person.date_of_birth);
    if (nodesWithDOB.length) {
      nodesWithDOB.sort((a, b) => new Date(a.data.person.date_of_birth) - new Date(b.data.person.date_of_birth));
      rootNodes = [nodesWithDOB[0]];
      console.log('No roots found, using oldest person as root:', rootNodes);
    } else {
      // Fallback: use the first node
      rootNodes = [nodes[0]];
      console.log('No roots or DOBs, using first node as root:', rootNodes);
    }
  }
  if (!rootNodes.length) {
    return { nodes, edges };
  }
  // Build a hierarchy for each root
  const d3Trees = rootNodes.map(root => {
    function buildD3Node(nodeId, visited = new Set()) {
      if (visited.has(nodeId)) return null; // Prevent cycles
      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      return {
        ...node,
        children: (childrenMap[nodeId] || [])
          .map(childId => buildD3Node(childId, new Set(visited)))
          .filter(Boolean),
      };
    }
    return d3.hierarchy(buildD3Node(root.id));
  });
  // Use d3.tree() to layout each tree
  const treeLayout = d3.tree().nodeSize([nodeWidth * 2, nodeHeight * 2]);
  let layoutedNodes = [];
  d3Trees.forEach(tree => {
    treeLayout(tree);
    tree.each(d => {
      layoutedNodes.push({
        ...d.data,
        position: {
          x: d.x,
          y: d.y,
        },
        targetPosition: 'top',
        sourcePosition: 'bottom',
      });
    });
  });
  // Optionally, adjust for multiple roots (shift horizontally)
  if (d3Trees.length > 1) {
    let offset = 0;
    d3Trees.forEach(tree => {
      const minX = Math.min(...Array.from(tree.descendants(), d => d.x));
      const maxX = Math.max(...Array.from(tree.descendants(), d => d.x));
      const width = maxX - minX;
      tree.each(d => {
        const node = layoutedNodes.find(n => n.id === d.data.id);
        if (node) node.position.x += offset;
      });
      offset += width + nodeWidth * 2;
    });
  }
  // Ensure all nodes are shown: add any not in layoutedNodes in a grid below
  const layoutedIds = new Set(layoutedNodes.map(n => n.id));
  let missingIndex = 0;
  nodes.forEach((n, i) => {
    if (!layoutedIds.has(n.id)) {
      layoutedNodes.push({
        ...n,
        position: {
          x: (missingIndex % 8) * (nodeWidth * 2),
          y: Math.floor(missingIndex / 8 + 5) * (nodeHeight * 2),
        },
        targetPosition: 'top',
        sourcePosition: 'bottom',
      });
      missingIndex++;
    }
  });
  // Return nodes in original order (for ReactFlow)
  layoutedNodes = nodes.map(n => layoutedNodes.find(ln => ln.id === n.id) || n);
  return { nodes: layoutedNodes, edges };
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
  const [interactivity, setInteractivity] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
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

  // Listen for pan/zoom changes
  const handleMove = useCallback((event, flowTransform) => {
    setTransform({
      x: flowTransform.x,
      y: flowTransform.y,
      zoom: flowTransform.zoom,
    });
  }, []);

  // Layout and fit view on mount or when nodes/edges change
  useEffect(() => {
    if (data && typeof data === 'object' && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
      console.log('Fetched nodes:', data.nodes);
      console.log('Fetched edges:', data.edges);
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
          // Add onClick handler for node selection
          onClick: () => openPersonCard(n),
        },
        position: { x: 0, y: 0 }, // will be set by layout
      }));
      const rfEdges = apiEdges.map((e, i) => ({
        id: `${e.type}-${e.from}-${e.to}`,
        source: String(e.from),
        target: String(e.to),
        type: e.type,
      }));
      // Use D3-based layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getD3LayoutedElements(rfNodes, rfEdges, 'TB');
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

  // Helper to render PersonCard as a fixed overlay above the canvas
  const renderPersonCardOverlay = (selectedPerson, nodes) => {
    if (!selectedPerson || !reactFlowWrapper.current) return null;
    const node = nodes.find(n => n.data && n.data.person && n.data.person.id === selectedPerson.id);
    const position = node ? node.position : undefined;
    const wrapperRect = reactFlowWrapper.current.getBoundingClientRect();
    let left = 0, top = 0;
    if (position) {
      // Use tracked transform state instead of DOM query
      const { x: translateX, y: translateY, zoom: scale } = transform;
      left = wrapperRect.left + window.scrollX + translateX + position.x * scale + 80;
      top = wrapperRect.top + window.scrollY + translateY + position.y * scale - 10;
      return ReactDOM.createPortal(
        <PersonCard
          person={selectedPerson}
          onClose={closePersonCard}
          onEdit={person => { closePersonCard(); handleEditPerson(person); }}
          onDelete={person => { closePersonCard(); handleDeletePerson(person); }}
          position={{ x: left, y: top }}
          fixed
        />,
        document.body
      );
    }
    return null;
  };

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', minWidth: 1200, position: 'relative' }}>
      {/* Only the original Move Nodes toggle should exist elsewhere */}
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
        nodesDraggable={interactivity}
        nodesConnectable={false}
        elementsSelectable={interactivity}
        onMove={(_, transformObj) => setTransform(transformObj)}
      >
        <Background gap={24} color="#eee" />
        <MiniMap nodeColor={() => '#4F868E'} />
        <Controls showInteractive={true} />
      </ReactFlow>
      {/* Render PersonCard as a fixed overlay above the canvas */}
      {renderPersonCardOverlay(selectedPerson, nodes)}
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
    </div>
  );
};

export default Tree;
