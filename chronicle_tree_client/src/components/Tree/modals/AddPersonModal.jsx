import React from 'react';
import Modal from '../../UI/Modal';
import PersonForm from '../../Forms/PersonForm';
import { useAddPerson, usePeople } from '../../../services/people';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { showValidationAlert, handleBackendError } from '../../../utils/validationAlerts';

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
        alert('Please select a relationship type.');
        return;
      }
      if (!data.relatedPersonId) {
        alert('Please select a person to relate to.');
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
      
      // Use centralized error handling
      handleBackendError(err);
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
          {addPerson.error?.response?.data?.message || 'Unable to add person. Please check the form.'}
        </div>
      )}
    </Modal>
  );
}
