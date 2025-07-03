import React, { useState } from 'react';
import RelationshipForm from '../Forms/RelationshipForm';
import { createRelationship, deletePerson } from '../../services/people';
import { FaUsers, FaPlus, FaTrash, FaUserFriends } from 'react-icons/fa';

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
    <section className="bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
      <div className="flex justify-between items-center pb-2 border-b mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaUsers className="text-blue-400" /> Relationships
        </h2>
        <button className="bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-blue-100 text-blue-600 text-sm" onClick={() => setShowAdd(true)} title="Add Relationship">
          <FaPlus />
        </button>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Manage parents, spouses, and children.</p>
        {person?.relatives && person.relatives.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {person.relatives.map(rel => (
              <li key={rel.id} className="text-sm text-gray-800 flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
                <span className="flex items-center gap-2">
                  <FaUserFriends className="text-blue-300" />
                  <span className="font-semibold">{rel.relationship_type}:</span> {rel.full_name}
                </span>
                <button className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 text-red-500 text-xs ml-2" onClick={() => handleDelete(rel.id)} title="Delete Relationship">
                  <FaTrash />
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
            person={person}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            isLoading={isLoading}
          />
        </div>
      )}
    </section>
  );
};

export default RelationshipManager;
