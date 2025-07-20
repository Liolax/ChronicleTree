import React from 'react';
import Modal from '../../UI/Modal';
import PersonForm from '../../Forms/PersonForm';
import { useAddPerson, usePeople } from '../../../services/people';
import { UserPlusIcon } from '@heroicons/react/24/solid';

export default function AddPersonModal({ isOpen = true, onClose, isFirstPerson = false }) {
  const addPerson = useAddPerson();
  const { data: people = [] } = usePeople();

  const handleSubmit = async (data) => {
    // Only send permitted fields
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.date_of_birth, // <-- fixed field name
      date_of_death: data.date_of_death, // <-- fixed field name
      gender: data.gender,
    };
    // Add relationship type and related person if not first person
    if (!isFirstPerson) {
      if (!data.relationType) {
        alert('Relationship Type is required');
        return;
      }
      if (!data.relatedPersonId) {
        alert('Selected Person is required');
        return;
      }
      payload.relation_type = data.relationType;
      payload.related_person_id = data.relatedPersonId;
    }
    console.log('AddPersonModal payload:', { person: payload }); // Debug log
    try {
      const response = await addPerson.mutateAsync(payload);
      
      // Enhanced success alert with person name
      if (response?.message) {
        alert(`✅ ${response.message}`);
      } else {
        alert(`✅ ${data.firstName} ${data.lastName} has been successfully added to the family tree!`);
      }
      
      onClose();
    } catch (err) {
      console.error('AddPersonModal error:', err?.response || err);
      
      // Enhanced error handling with specific alert messages
      if (err?.response?.data?.errors) {
        const errorMessages = err.response.data.errors;
        if (Array.isArray(errorMessages)) {
          // Show each error message with appropriate icons and formatting
          errorMessages.forEach(error => {
            if (error.includes("Cannot add child born after parent's death")) {
              alert(`⚠️ Temporal Validation Error:\n\n${error}\n\nPlease adjust the birth date to be before the parent's death date.`);
            } else if (error.includes("only") && error.includes("years older")) {
              alert(`⚠️ Age Validation Error:\n\n${error}\n\nPlease ensure the parent is at least 12 years older than the child.`);
            } else if (error.includes("already has 2 biological parents")) {
              alert(`⚠️ Multiple Parents Error:\n\n${error}`);
            } else if (error.includes("Selected Person are required")) {
              alert('⚠️ Missing Information:\n\nPlease select both a relationship type and a person to relate to.');
            } else {
              alert(`❌ Validation Error:\n\n${error}`);
            }
          });
        } else {
          alert(`❌ Error: ${errorMessages}`);
        }
      } else if (err?.response?.data?.message) {
        alert(`❌ Error: ${err.response.data.message}`);
      } else {
        alert('❌ Failed to add person. Please check your input and try again.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center">
          <UserPlusIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Add New Person
        </span>
      }
    >
      <PersonForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={addPerson.isPending}
        people={people}
        isFirstPerson={isFirstPerson}
        showRelationshipFields={true}
        aria-describedby="add-person-instructions"
        cancelVariant="grey"
      />
      {addPerson.isError && (
        <div
          className="text-red-600 mt-2 text-sm"
          role="alert"
          aria-live="assertive"
        >
          {addPerson.error?.response?.data?.message || 'Failed to add person.'}
        </div>
      )}
    </Modal>
  );
}
