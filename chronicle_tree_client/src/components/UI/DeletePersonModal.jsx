import React, { useState } from 'react';
import Button from '../UI/Button';

const DeletePersonModal = ({ person, relationships = {}, onConfirm, onCancel, isLoading }) => {
  const [input, setInput] = useState('');
  const canDelete = input.trim() === `${person.first_name} ${person.last_name}`;

  // Only show direct relationships, exclude the person themselves and in-laws
  const directGroups = [
    { label: 'Parents', rels: (relationships.Parents || []).filter(r => r.id !== person.id) },
    { label: 'Children', rels: (relationships.Children || []).filter(r => r.id !== person.id) },
    { label: 'Spouses', rels: (relationships.Spouses || []).filter(r => r.id !== person.id) },
    { label: 'Siblings', rels: (relationships.Siblings || []).filter(r => r.id !== person.id) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-red-200">
        <h2 className="text-xl font-bold text-red-700 mb-2">Delete {person.first_name} {person.last_name}?</h2>
        <p className="text-gray-700 mb-3">
          This action <span className="font-semibold text-red-600">cannot be undone</span>.<br/>
          Deleting this person will remove them from the family tree and delete all their relationships.
        </p>
        <div className="mb-3">
          <div className="font-semibold text-gray-800 mb-1">
            Relationships of <span className="text-red-700">{person.first_name} {person.last_name}</span> affected:
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {directGroups.map(group =>
              group.rels.length > 0 && (
                <li key={group.label}>
                  <span className="font-semibold">{group.label}:</span> {group.rels.map(r => r.full_name || `${r.first_name} ${r.last_name}`).join(', ')}
                </li>
              )
            )}
          </ul>
        </div>
        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">Type <span className="font-semibold">{person.first_name} {person.last_name}</span> to confirm:</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-400"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={person.first_name + ' ' + person.last_name}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" onClick={onCancel} variant="secondary" disabled={isLoading}>Cancel</Button>
          <Button type="button" onClick={onConfirm} disabled={!canDelete || isLoading} variant="danger">
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeletePersonModal;
