import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreeState } from '../../context/TreeStateContext';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import EditPersonModal from './EditPersonModal';
import DeletePersonModal from './DeletePersonModal';

const PersonCard = ({ person, onClose }) => {
  const navigate = useNavigate();
  const { isPersonCardVisible, closePersonCard } = useTreeState();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!isPersonCardVisible || !person) return null;

  const birthDate = person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : 'N/A';
  const deathDate = person.date_of_death ? new Date(person.date_of_death).toLocaleDateString() : 'N/A';

  const handleViewProfile = () => {
    navigate(`/profile/${person.id}`);
    closePersonCard();
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  return (
    <>
      <Modal isOpen={isPersonCardVisible} onClose={closePersonCard}>
        <div className="flex items-center mb-4">
          <div className="rounded-full w-16 h-16 flex justify-center items-center bg-gray-100 text-gray-400 mr-4">
            {/* Placeholder for an image or initials */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold">{`${person.first_name} ${person.last_name}`}</h3>
            <p className="text-sm text-gray-600">{person.gender}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p><strong>Born:</strong> {birthDate}</p>
          <p><strong>Died:</strong> {deathDate}</p>
          <p><strong>Place of Birth:</strong> {person.place_of_birth || 'N/A'}</p>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div>
            <Button onClick={handleEdit} variant="tertiary">Edit</Button>
            <Button onClick={handleDelete} variant="danger-tertiary" className="ml-2">Delete</Button>
          </div>
          <div className="flex space-x-4">
            <Button onClick={closePersonCard} variant="secondary">Close</Button>
            <Button onClick={handleViewProfile} variant="primary">View Profile</Button>
          </div>
        </div>
      </Modal>
      {isEditModalOpen && <EditPersonModal person={person} onClose={() => setEditModalOpen(false)} />}
      {isDeleteModalOpen && <DeletePersonModal personId={person.id} onClose={() => setDeleteModalOpen(false)} />}
    </>
  );
};

export default PersonCard;
