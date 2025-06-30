import React from 'react';

const RelationshipManager = ({ person }) => {
  // Placeholder for future relationship management UI
  return (
    <div className="bg-white shadow sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Relationships</h3>
        <div className="mt-5">
          <p className="text-sm text-gray-600">Manage parents, spouses, and children.</p>
          {/* TODO: Relationship management UI will go here */}
          {person?.relatives && person.relatives.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {person.relatives.map(rel => (
                <li key={rel.id} className="text-sm text-gray-800">
                  <span className="font-semibold">{rel.relationship_type}:</span> {rel.full_name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No relationships found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipManager;
