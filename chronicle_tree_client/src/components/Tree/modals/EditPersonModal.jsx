import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../UI/Modal';
import PersonForm from '../../Forms/PersonForm';
import { updatePerson, usePeople } from '../../../services/people';

const EditPersonModal = ({ person, isOpen = true, onClose }) => {
  const queryClient = useQueryClient();
  const { data: people = [] } = usePeople();

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => updatePerson(person.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      queryClient.invalidateQueries({ queryKey: ['person', person.id] });
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
      date_of_birth: data.date_of_birth,
      date_of_death: data.date_of_death,
      gender: data.gender,
    };
    mutate(personData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Person">
      <PersonForm person={person} onSubmit={handleSubmit} onCancel={onClose} isLoading={isLoading} people={people} cancelVariant="grey" />
    </Modal>
  );
};

export default EditPersonModal;
