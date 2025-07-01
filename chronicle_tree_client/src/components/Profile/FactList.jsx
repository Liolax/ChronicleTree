import React from 'react';

const FactList = ({ facts, onEdit, onDelete }) => {
  if (!facts || facts.length === 0) {
    return <p className="text-gray-400">No facts available.</p>;
  }
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Key Facts</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Important dates and events in this person's life.</p>
        </div>
        <ul className="mt-5 divide-y divide-gray-200">
          {facts.map((fact) => (
            <li key={fact.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-600 mr-4">{fact.date ? new Date(fact.date).toLocaleDateString() : ''}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{fact.title}</p>
                  <p className="text-sm text-gray-500">{fact.description}</p>
                </div>
              </div>
              {(onEdit || onDelete) && (
                <div className="flex gap-2 ml-4">
                  {onEdit && (
                    <button className="text-blue-600 hover:underline text-xs" onClick={() => onEdit(fact)} title="Edit Fact">
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button className="text-red-500 hover:underline text-xs" onClick={() => onDelete(fact.id)} title="Delete Fact">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FactList;
