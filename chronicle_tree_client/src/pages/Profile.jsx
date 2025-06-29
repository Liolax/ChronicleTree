import React, { useState } from 'react';
import { useCurrentUser } from '../services/users';
import PageHeader from '../components/Layout/PageHeader';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileDetails from '../components/Profile/ProfileDetails';
import Timeline from '../components/Profile/Timeline';
import MediaGallery from '../components/Profile/MediaGallery';
import FactList from '../components/Profile/FactList';
import RelationshipManager from '../components/Profile/RelationshipManager';
import Tabs from '../components/Layout/Tabs';

export default function Profile() {
  const { data: user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState('Details');

  if (isLoading) return <p>Loading profile...</p>;

  const tabs = [
    { name: 'Details', component: <><ProfileDetails user={user} /><FactList facts={user?.facts} /></> },
    { name: 'Timeline', component: <Timeline /> },
    { name: 'Media', component: <MediaGallery /> },
    { name: 'Relationships', component: <RelationshipManager person={user} /> },
  ];

  const activeComponent = tabs.find(tab => tab.name === activeTab)?.component;

  return (
    <>
      <PageHeader title="My Profile" subtitle="View and manage your personal information." />
      <div className="max-w-4xl mx-auto py-10 sm:px-6 lg:px-8">
        <ProfileHeader user={user} />
        <div className="mt-6">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="mt-8">
          {activeComponent}
        </div>
      </div>
    </>
  );
}
