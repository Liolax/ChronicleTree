import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Button from '../UI/Button';

const PersonNode = ({ data }) => {
  const { person, onEdit, onDelete } = data;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-60">
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100 text-gray-400">
          {/* Placeholder for an image or initials */}
          <span>{person.first_name.charAt(0)}</span>
        </div>
        <div className="ml-3 flex-grow">
          <div className="text-lg font-bold">{person.first_name} {person.last_name}</div>
          <div className="text-gray-500 text-sm">{person.birth_date} - {person.death_date || 'Present'}</div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-2">
        <Button size="sm" variant="secondary" onClick={() => onEdit(person)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(person)}>Delete</Button>
      </div>

      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
};

export default memo(PersonNode);
