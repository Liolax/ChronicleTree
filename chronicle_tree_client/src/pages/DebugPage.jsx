import React from 'react';

function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-600">Debug functionality has been removed for production.</p>
        <p className="text-gray-600 mt-2">This page is maintained for routing compatibility.</p>
      </div>
    </div>
  );
}

export default DebugPage;