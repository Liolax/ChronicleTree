import React from 'react';

const FactList = ({ facts }) => {
  if (!facts || facts.length === 0) {
    return <p>No facts available.</p>;
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
            <li key={fact.id} className="py-4 flex">
              <div className="flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600">{new Date(fact.date).toLocaleDateString()}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{fact.title}</p>
                <p className="text-sm text-gray-500">{fact.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FactList;
