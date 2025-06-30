import React from 'react';
import Modal from '../../UI/Modal';
import PersonForm from '../../Forms/PersonForm';
import { useAddPerson } from '../../../services/people';
import { UserPlusIcon } from '@heroicons/react/24/solid';

export default function AddPersonModal({ isOpen = true, onClose, people = [], isFirstPerson = false }) {
  const addPerson = useAddPerson();

  const handleSubmit = async (data) => {
    // Only send relationship fields if not the first person
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      birth_date: data.birthDate,
      death_date: data.deathDate,
      gender: data.gender,
      is_deceased: data.isDeceased,
    };
    if (!isFirstPerson) {
      payload.relation_type = data.relationType;
      payload.related_person_id = data.relatedPersonId;
    }
    console.log('AddPersonModal payload:', payload); // Debug log
    try {
      await addPerson.mutateAsync(payload);
      onClose();
    } catch (err) {
      console.error('AddPersonModal error:', err?.response || err);
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
