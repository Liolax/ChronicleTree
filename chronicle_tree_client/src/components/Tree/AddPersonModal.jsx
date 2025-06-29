import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../UI/Modal';
import PersonForm from '../Forms/PersonForm';
import { createPerson } from '../../services/people';

const AddPersonModal = ({ onClose }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(createPerson, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tree']);
      onClose();
    },
    onError: (error) => {
      // Handle error, e.g., show a notification
      console.error("Error creating person:", error);
    },
  });

  const handleSubmit = (data) => {
    const personData = {
      first_name: data.firstName,
      last_name: data.lastName,
      birth_date: data.birthDate,
      death_date: data.deathDate,
      gender: data.gender,
    };
    mutate(personData);
  };

  return (
    <Modal title="Add New Person" onClose={onClose}>
      <PersonForm onSubmit={handleSubmit} onCancel={onClose} isLoading={isLoading} />
    </Modal>
  );
};

export default AddPersonModal;
