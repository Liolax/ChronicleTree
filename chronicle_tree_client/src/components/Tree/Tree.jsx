import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCurrentUser } from '../../services/users';
import { useTree } from '../../services/people';
import PersonNode from './PersonNode'; // Import the custom node
import EditPersonModal from './modals/EditPersonModal';
import ConfirmDeleteModal from '../UI/ConfirmDeleteModal';

const nodeTypes = {
  person: PersonNode,
};

const initialNodes = [];
const initialEdges = [];

function Tree() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { data: user } = useCurrentUser();
  const { data: treeData, isLoading } = useTree(user?.person_id);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleEdit = (person) => {
    setSelectedPerson(person);
    setEditModalOpen(true);
  };

  const handleDelete = (person) => {
    setSelectedPerson(person);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = (updatedPerson) => {
    console.log('Saving person:', updatedPerson);
    // Here you would call an API to update the person
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    console.log('Deleting person:', selectedPerson);
    // Here you would call an API to delete the person
    setDeleteModalOpen(false);
  };

  useEffect(() => {
    if (treeData) {
      const newNodes = treeData.nodes.map((person) => ({
        id: person.id.toString(),
        type: 'person',
        position: { x: Math.random() * 400, y: Math.random() * 400 }, // Position randomly for now
        data: {
          label: `${person.first_name} ${person.last_name}`,
          birthDate: person.birth_date,
          deathDate: person.death_date,
          onEdit: () => handleEdit(person),
          onDelete: () => handleDelete(person),
        },
      }));

      const newEdges = treeData.edges.map((edge) => ({
        id: `e${edge.from}-${edge.to}`,
        source: edge.from.toString(),
        target: edge.to.toString(),
      }));

      setNodes(newNodes);
      setEdges(newEdges);
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

  if (isLoading) {
    return <div>Loading Tree...</div>;
  }

  return (
    <div style={{ height: '70vh', width: '100%' }} className="bg-gray-50 rounded-lg shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      {selectedPerson && (
        <EditPersonModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveEdit}
          person={selectedPerson}
        />
      )}
      {selectedPerson && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Person"
          message={`Are you sure you want to delete ${selectedPerson.first_name} ${selectedPerson.last_name}? This action cannot be undone.`}
        />
      )}
    </div>
  );
}

export default Tree;
