import React from 'react';
import Modal from '../../UI/Modal';
import PersonForm from '../../Forms/PersonForm';
import { useAddPerson, usePeople } from '../../../services/people';
import { UserPlusIcon } from '@heroicons/react/24/solid';

export default function AddPersonModal({ onClose }) {
  const addPerson = useAddPerson();
  const { data: people = [] } = usePeople();

  const handleSubmit = async (data) => {
    await addPerson.mutateAsync({
      first_name: data.firstName,
      last_name: data.lastName,
      birth_date: data.birthDate,
      death_date: data.deathDate,
      gender: data.gender,
      is_deceased: data.isDeceased,
      relation_type: data.relationType,
      related_person_id: data.relatedPersonId,
    });
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={<span className="flex items-center"><UserPlusIcon className="h-5 w-5 mr-2 text-indigo-600" />Add New Person</span>}>
      <PersonForm onSubmit={handleSubmit} onCancel={onClose} isLoading={addPerson.isPending} people={people} />
      {addPerson.isError && (
        <div className="text-red-600 mt-2 text-sm">{addPerson.error?.response?.data?.message || 'Failed to add person.'}</div>
      )}
    </Modal>
  );
}
