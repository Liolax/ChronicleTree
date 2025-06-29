import dagre from 'dagre';
import React, { useCallback, useEffect } from 'react';
import { ReactFlow, addEdge, Background, Controls, MiniMap, useEdgesState, useNodesState, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import { useCurrentUser } from '../../services/users';
import { useTree, usePeople } from '../../services/people';
import CustomNode from './CustomNode';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const nodeTypes = {
  person: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

function TreeInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { data: user } = useCurrentUser();
  const { data: people } = usePeople();
  // Use the user's person_id, or fallback to the first person in the list
  const rootPersonId = user?.person_id || (people && people.length > 0 ? people[0].id : null);
  const { data: treeData, isLoading } = useTree(rootPersonId);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    if (treeData && treeData.nodes && treeData.nodes.length > 0) {
      const initialNodes = treeData.nodes.map((person) => ({
        id: person.id.toString(),
        type: 'person',
        data: {
          label: person.full_name || `${person.first_name} ${person.last_name}`,
          birthDate: person.date_of_birth || person.birth_date,
          deathDate: person.date_of_death || person.death_date,
          person: person, // Pass the entire person object
        },
        position: { x: 0, y: 0 }, // Initial position, will be updated by layout
      }));

      const initialEdges = treeData.edges.map((edge) => ({
        id: `e${edge.from}-${edge.to}`,
        source: edge.from.toString(),
        target: edge.to.toString(),
        type: edge.type === 'spouse' ? 'smoothstep' : 'default',
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [treeData, setNodes, setEdges]);

  if (isLoading) {
    return <div>Loading Tree...</div>;
  }

  if (!nodes.length) {
    return <div className="text-center text-gray-400 py-20">No people found in your tree. Add a person to get started!</div>;
  }

  return (
    <div style={{ height: '70vh', width: '100%' }} className="bg-gray-50 rounded-lg shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

function Tree() {
  // Wrap TreeInner with ReactFlowProvider to provide context for ReactFlow and its hooks/components
  return (
    <ReactFlowProvider>
      <TreeInner />
    </ReactFlowProvider>
  );
}

export default Tree;
