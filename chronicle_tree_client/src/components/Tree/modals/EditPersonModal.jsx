import React from 'react';
import Modal from '../../UI/Modal';
import EditPersonForm from '../../Forms/EditPersonForm';
import { useUpdatePerson } from '../../../services/people';

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
        // Show success message
        if (response?.message) {
          alert(`✅ ${response.message}`);
        } else {
          alert(`✅ ${data.firstName} ${data.lastName} has been successfully updated!`);
        }
        onClose();
      },
      onError: (error) => {
        console.error("Error updating person:", error);
        
        // Enhanced error handling for relationship validation
        if (error?.response?.data?.errors) {
          const errorMessages = error.response.data.errors;
          if (Array.isArray(errorMessages)) {
            errorMessages.forEach(errorMsg => {
              if (errorMsg.includes("years YOUNGER than their child") || errorMsg.includes("years OLDER than their parent")) {
                alert(`⚠️ Age Relationship Error:\n\n${errorMsg}\n\nPlease adjust the birth date to maintain proper parent-child age relationships.`);
              } else if (errorMsg.includes("only") && errorMsg.includes("years older")) {
                alert(`⚠️ Insufficient Age Gap:\n\n${errorMsg}\n\nParents must be at least 12 years older than their children.`);
              } else if (errorMsg.includes("before child's birth") || errorMsg.includes("after death date")) {
                alert(`⚠️ Timeline Error:\n\n${errorMsg}\n\nPlease check the chronological order of birth and death dates.`);
              } else {
                alert(`❌ Validation Error:\n\n${errorMsg}`);
              }
            });
          } else {
            alert(`❌ Error: ${errorMessages}`);
          }
        } else {
          alert(`❌ Failed to update person: ${error?.response?.data?.message || error.message}`);
        }
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
