import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import EditPersonModal from './modals/EditPersonModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import { useDeletePerson } from '../../services/people';

const CustomNode = ({ data }) => {
  const { person } = data;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deletePersonMutation = useDeletePerson();

  const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : '';
  const deathYear = person.death_date ? new Date(person.death_date).getFullYear() : '';
  const lifespan = birthYear && deathYear ? `(${birthYear}–${deathYear})` : (birthYear ? `(b. ${birthYear})` : '');

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deletePersonMutation.mutate(person.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
      }
    });
  };

  return (
    <>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-56 group relative">
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <div className="flex flex-col items-center">
          <div className="rounded-full w-14 h-14 flex justify-center items-center bg-gray-100 text-gray-400 mb-2">
            {/* Avatar or initials */}
            <span className="text-xl font-bold">{person.first_name?.[0]}</span>
          </div>
          <div className="text-lg font-bold text-center">{person.first_name} {person.last_name}</div>
          <div className="text-gray-500 text-sm">{lifespan}</div>
        </div>
        <div className="flex justify-center gap-2 mt-2">
          <button
            className="p-1 rounded hover:bg-gray-100"
            title="Edit"
            onClick={handleEditClick}
          >
            <PencilIcon className="w-5 h-5 text-blue-500" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100"
            title="Delete"
            onClick={handleDeleteClick}
          >
            <TrashIcon className="w-5 h-5 text-red-500" />
          </button>
        </div>
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
      {isEditModalOpen && (
        <EditPersonModal person={person} onClose={() => setIsEditModalOpen(false)} />
      )}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          title="Delete Person"
          message={`Are you sure you want to delete ${person.first_name} ${person.last_name}? This cannot be undone.`}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={deletePersonMutation.isLoading}
        />
      )}
    </>
  );
};

export default memo(CustomNode);
