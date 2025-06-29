import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { deletePerson } from '../../services/people';

const DeletePersonModal = ({ personId, onClose }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(() => deletePerson(personId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['tree']);
      onClose();
    },
    onError: (error) => {
      console.error("Error deleting person:", error);
      // You might want to show a user-facing error message here
    },
  });

  const handleDelete = () => {
    mutate();
  };

  return (
    <Modal title="Delete Person" onClose={onClose}>
      <div className="text-gray-700">
        <p>Are you sure you want to delete this person? This action cannot be undone.</p>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
};

export default DeletePersonModal;
