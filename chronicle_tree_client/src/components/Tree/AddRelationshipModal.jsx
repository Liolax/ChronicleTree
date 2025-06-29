import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../UI/Modal';
import RelationshipForm from '../Forms/RelationshipForm';
import { createRelationship } from '../../services/people';

const AddRelationshipModal = ({ onClose, people }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(createRelationship, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tree']);
      onClose();
    },
    onError: (error) => {
      console.error("Error creating relationship:", error);
    },
  });

  const handleSubmit = (data) => {
    const relationshipData = {
      person_id: data.person1Id,
      relative_id: data.person2Id,
      relationship_type: data.relationshipType,
    };
    mutate(relationshipData);
  };

  return (
    <Modal title="Add New Relationship" onClose={onClose}>
      <RelationshipForm 
        onSubmit={handleSubmit} 
        onCancel={onClose} 
        people={people} 
        isLoading={isLoading} 
      />
    </Modal>
  );
};

export default AddRelationshipModal;
