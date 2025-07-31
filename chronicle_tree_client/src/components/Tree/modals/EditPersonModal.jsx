import React from 'react';
import Modal from '../../UI/Modal';
import EditPersonForm from '../../Forms/EditPersonForm';
import { useUpdatePerson } from '../../../services/people';
import { handleBackendError, showOperationError, showOperationSuccess } from '../../../utils/validationAlerts';

const EditPersonModal = ({ person, isOpen = true, onClose }) => {
  const updatePersonMutation = useUpdatePerson();

  const handleSubmit = (data) => {
    const personData = {
      id: person.id,
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.birthDate,
      date_of_death: data.deathDate,
      gender: data.gender,
    };
    
    updatePersonMutation.mutate(personData, {
      onSuccess: (response) => {
        // Show confirmation message after successful update
        if (response?.message) {
          showOperationError('updateFailed');
        } else {
          showOperationSuccess('personUpdated', data);
        }
        onClose();
      },
      onError: (error) => {
        // Handle any errors that occur during the update
        handleBackendError(error);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Person">
      <EditPersonForm 
        person={person} 
        onSave={handleSubmit} 
        onCancel={onClose} 
        isLoading={updatePersonMutation.isPending}
      />
    </Modal>
  );
};

export default EditPersonModal;
