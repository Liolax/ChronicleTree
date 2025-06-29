import React from 'react';
import Modal from '../../UI/Modal';
import EditRelationshipForm from '../../Forms/EditRelationshipForm';

const EditRelationshipModal = ({ relationship, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Relationship">
      <EditRelationshipForm relationship={relationship} onSave={onSave} onCancel={onClose} />
    </Modal>
  );
};

export default EditRelationshipModal;
