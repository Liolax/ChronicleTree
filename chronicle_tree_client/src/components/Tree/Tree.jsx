import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useTree } from '../../services/people';
import { useCurrentUser } from '../../services/users';

const initialNodes = [];
const initialEdges = [];

function Tree() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { data: user } = useCurrentUser();
  const { data: treeData } = useTree(user?.person_id);

  useEffect(() => {
    if (treeData) {
      // Transform the API data into a format that React Flow can use
      const flowNodes = treeData.nodes.map((person, index) => ({
        id: person.id.toString(),
        position: { x: index * 250, y: Math.random() * 400 }, // Simple positioning
        data: { label: `${person.first_name} ${person.last_name}` },
      }));

      const flowEdges = treeData.edges.map((edge, index) => ({
        id: `e${edge.from}-${edge.to}-${index}`,
        source: edge.from.toString(),
        target: edge.to.toString(),
        animated: true,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [treeData]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '80vh', width: '100%' }} className="bg-gray-50 rounded-lg shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Tree;
