import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import EditPersonModal from './EditPersonModal';
import DeletePersonModal from './DeletePersonModal';

const CustomNode = ({ data }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const birthYear = data.date_of_birth ? new Date(data.date_of_birth).getFullYear() : '';
  const deathYear = data.date_of_death ? new Date(data.date_of_death).getFullYear() : '';
  const lifespan = birthYear && deathYear ? `(${birthYear}–${deathYear})` : (birthYear ? `(b. ${birthYear})` : '');

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-56 group relative">
        {/* Handle for incoming connections (as a child) */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-16 !bg-teal-500"
        />

        <div className="flex items-center">
          <div className="rounded-full w-10 h-10 flex justify-center items-center bg-gray-100 text-gray-400 mr-2">
            {/* Placeholder for an image or initials */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-grow">
            <div className="text-sm font-bold truncate">{data.label}</div>
            {lifespan && <div className="text-xs text-gray-500">{lifespan}</div>}
          </div>
        </div>

        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={handleEditClick} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
            <PencilIcon className="h-3 w-3 text-gray-600" />
          </button>
          <button onClick={handleDeleteClick} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
            <TrashIcon className="h-3 w-3 text-red-600" />
          </button>
        </div>

        {/* Handle for outgoing connections (as a parent) */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-16 !bg-teal-500"
        />
      </div>
      {isEditModalOpen && (
        <EditPersonModal
          person={data.person}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {isDeleteModalOpen && (
        <DeletePersonModal
          personId={data.person.id}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
};

export default memo(CustomNode);
