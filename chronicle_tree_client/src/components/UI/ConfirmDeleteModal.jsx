import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDeleteModal = ({ onCancel, onConfirm, isLoading, title, message }) => {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="py-4">
        <p>{message}</p>
      </div>
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
