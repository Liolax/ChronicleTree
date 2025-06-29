import React from 'react';

export default function ProfileHeader({ user }) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
      <div className="md:flex items-center p-8">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Member</span>
          </div>
          <p className="text-gray-600 mb-6">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
