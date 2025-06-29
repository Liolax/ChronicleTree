import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../UI/Modal';
import PersonForm from '../../Forms/PersonForm';
import { updatePerson } from '../../../services/people';

const EditPersonModal = ({ person, onClose }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => updatePerson(person.id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['tree']);
      queryClient.invalidateQueries(['person', person.id]);
      onClose();
    },
    onError: (error) => {
      console.error("Error updating person:", error);
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
    <Modal title="Edit Person" onClose={onClose}>
      <PersonForm person={person} onSubmit={handleSubmit} onCancel={onClose} isLoading={isLoading} />
    </Modal>
  );
};

export default EditPersonModal;
