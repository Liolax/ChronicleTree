import React from 'react';

export default function ProfileHeader({ user }) {
  return (
    <div>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
        </div>
        <p className="text-gray-600 mb-6">{user?.email}</p>
      </div>
    </div>
  );
}
