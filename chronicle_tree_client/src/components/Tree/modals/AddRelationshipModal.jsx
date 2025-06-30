import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../UI/Modal';
import RelationshipForm from '../../Forms/RelationshipForm';
import { createRelationship } from '../../../services/people';

const AddRelationshipModal = ({ isOpen = true, onClose, people }) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Relationship">
      <RelationshipForm 
        onSubmit={handleSubmit} 
        onCancel={onClose} 
        people={people} 
        isLoading={isLoading} 
        cancelVariant="grey"
      />
    </Modal>
  );
};

export default AddRelationshipModal;
