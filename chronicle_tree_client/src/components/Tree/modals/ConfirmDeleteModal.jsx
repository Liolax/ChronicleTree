import React from 'react';
import Modal from '../../UI/Modal';
import Button from '../../UI/Button';
import { useDeletePerson } from '../../../services/people';
import { useQueryClient } from '@tanstack/react-query';

const ConfirmDeleteModal = ({ person, isOpen = true, onClose, confirmText, description, confirmButtonClass }) => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useDeletePerson();

  const handleDelete = () => {
    mutate(person.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tree'] });
        queryClient.invalidateQueries({ queryKey: ['people'] });
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={confirmText || 'Delete?'}>
      <div className="py-4">
        <p>{description || 'Are you sure you want to delete this person? This action cannot be undone.'}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="grey" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
