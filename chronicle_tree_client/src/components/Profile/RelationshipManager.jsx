import React from 'react';

const RelationshipManager = ({ person }) => {
  // This is a placeholder component.
  // In the future, it will allow adding/editing/removing relationships.

  return (
    <div className="bg-white shadow sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Relationships</h3>
        <div className="mt-5">
          <p className="text-sm text-gray-600">Manage parents, spouses, and children.</p>
          {/* Relationship management UI will go here */}
        </div>
      </div>
    </div>
  );
};

export default RelationshipManager;
