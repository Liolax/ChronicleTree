import React from 'react';
import Card from '../UI/Card';

export default function ProfileDetails({ person }) {
  return (
    <Card title="Profile Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium text-gray-500">Name</p>
          <p className="text-gray-800">{person?.full_name}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Gender</p>
          <p className="text-gray-800">{person?.gender || 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Date of Birth</p>
          <p className="text-gray-800">{person?.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Date of Death</p>
          <p className="text-gray-800">{person?.date_of_death ? new Date(person.date_of_death).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Age</p>
          <p className="text-gray-800">{person?.age !== null && person?.age !== undefined ? person.age : 'N/A'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-medium text-gray-500">Bio</p>
          <p className="text-gray-800">{person?.profile?.bio || 'No bio available.'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-medium text-gray-500">Notes</p>
          <p className="text-gray-800">{person?.profile?.notes || 'No notes available.'}</p>
        </div>
      </div>
    </Card>
  );
}
