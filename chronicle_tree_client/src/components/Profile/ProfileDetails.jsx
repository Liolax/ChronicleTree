import React from 'react';
import Card from '../UI/Card';

export default function ProfileDetails({ user }) {
  return (
    <Card title="Profile Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium text-gray-500">Name</p>
          <p className="text-gray-800">{user?.name}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Email</p>
          <p className="text-gray-800">{user?.email}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Joined On</p>
          <p className="text-gray-800">{new Date(user?.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Last Updated</p>
          <p className="text-gray-800">{new Date(user?.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
    </Card>
  );
}
