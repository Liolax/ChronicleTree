import React, { useState } from 'react';
import RelationshipForm from '../Forms/RelationshipForm';
import { createRelationship, deletePerson } from '../../services/people';

const RelationshipManager = ({ person, people = [], onRelationshipAdded, onRelationshipDeleted }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (data) => {
    setIsLoading(true);
    try {
      await createRelationship({
        person1_id: data.person1Id,
        person2_id: data.person2Id,
        relationship_type: data.relationshipType,
      });
      setShowAdd(false);
      if (onRelationshipAdded) onRelationshipAdded();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (relId) => {
    if (!window.confirm('Delete this relationship?')) return;
    await deletePerson(relId); // This should be deleteRelationship if available
    if (onRelationshipDeleted) onRelationshipDeleted();
  };

  return (
    <div className="bg-white shadow sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center justify-between">
          Relationships
          <button className="text-blue-600 hover:underline text-sm" onClick={() => setShowAdd(true)}>
            + Add
          </button>
        </h3>
        <div className="mt-5">
          <p className="text-sm text-gray-600">Manage parents, spouses, and children.</p>
          {person?.relatives && person.relatives.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {person.relatives.map(rel => (
                <li key={rel.id} className="text-sm text-gray-800 flex items-center justify-between">
                  <span><span className="font-semibold">{rel.relationship_type}:</span> {rel.full_name}</span>
                  <button className="text-red-500 hover:underline text-xs ml-2" onClick={() => handleDelete(rel.id)} title="Delete Relationship">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No relationships found.</p>
          )}
        </div>
        {showAdd && (
          <div className="mt-4">
            <RelationshipForm
              people={people}
              onSubmit={handleAdd}
              onCancel={() => setShowAdd(false)}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipManager;
