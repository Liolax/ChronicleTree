import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreeState } from '../../context/TreeStateContext';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import EditPersonModal from './modals/EditPersonModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import { useDeletePerson } from '../../services/people';

const PersonCard = ({ person }) => {
  const navigate = useNavigate();
  const { isPersonCardVisible, closePersonCard } = useTreeState();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const deletePerson = useDeletePerson();

  if (!isPersonCardVisible || !person) return null;

  const birthDate = person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : 'N/A';
  const deathDate = person.date_of_death ? new Date(person.date_of_death).toLocaleDateString() : 'N/A';

  const handleViewProfile = () => {
    navigate(`/profile/${person.id}`);
    closePersonCard();
  };

  const handleEdit = () => setEditModalOpen(true);
  const handleDelete = () => setDeleteModalOpen(true);

  const handleConfirmDelete = () => {
    deletePerson.mutate(person.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        closePersonCard();
      },
    });
  };

  return (
    <>
      <Modal isOpen={isPersonCardVisible} onClose={closePersonCard}>
        <div className="flex items-center mb-4">
          <div className="rounded-full w-16 h-16 flex justify-center items-center bg-gray-100 text-gray-400 mr-4 shadow">
            {/* Avatar or initials */}
            {person.avatar_url ? (
              <img src={person.avatar_url} alt={person.full_name || person.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">{(person.full_name || person.name || '?')[0]}</span>
            )}
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{person.full_name || person.name}</div>
            <div className="text-gray-500 text-sm">{birthDate} - {deathDate}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={handleViewProfile}>View Profile</Button>
          <Button variant="secondary" onClick={handleEdit}>Edit Details</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
      {isEditModalOpen && (
        <EditPersonModal person={person} onClose={() => setEditModalOpen(false)} />
      )}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          title="Delete Person"
          message={`Are you sure you want to delete ${person.full_name || person.name}? This cannot be undone.`}
          isLoading={deletePerson.isLoading}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default PersonCard;
