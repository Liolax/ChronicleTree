import React from 'react';
import Modal from '../../UI/Modal';
import EditPersonForm from '../../Forms/EditPersonForm';

const EditPersonModal = ({ person, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Person">
      <EditPersonForm person={person} onSave={onSave} onCancel={onClose} />
    </Modal>
  );
};

export default EditPersonModal;
