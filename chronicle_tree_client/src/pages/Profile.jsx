import React, { useState } from 'react';
import PageHeader from '../components/Layout/PageHeader';
import { useCurrentUser } from '../services/users';
import Card from '../components/UI/Card';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileDetails from '../components/Profile/ProfileDetails';
import Timeline from '../components/Profile/Timeline';
import MediaGallery from '../components/Profile/MediaGallery';
import Tabs from '../components/Layout/Tabs';

export default function Profile() {
  const { data: user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState('Timeline');

  if (isLoading) return <p>Loading profile...</p>;

  const tabs = [
    { name: 'Timeline', component: <Timeline /> },
    { name: 'Media', component: <MediaGallery /> },
    { name: 'About', component: <ProfileDetails user={user} /> },
  ];

  const activeComponent = tabs.find(tab => tab.name === activeTab)?.component;

  return (
    <>
      <PageHeader title="My Profile" subtitle="View and manage your personal information." />
      <div className="max-w-4xl mx-auto py-10 sm:px-6 lg:px-8">
        <Card>
          <div className="md:flex">
            <div className="w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Member</span>
              </div>
              <p className="text-gray-600 mb-6">{user?.email}</p>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-500">Joined On</p>
                    <p className="text-gray-800">{new Date(user?.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Last Updated</p>
                    <p className="text-gray-800">{new Date(user?.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Card>
        <div className="mt-6">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-8">{activeComponent}</div>
        </div>
      </div>
    </>
  );
}
