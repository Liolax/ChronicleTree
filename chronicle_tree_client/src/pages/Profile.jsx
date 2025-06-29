import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePeople } from '../services/people';
import PageHeader from '../components/Layout/PageHeader';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileDetails from '../components/Profile/ProfileDetails';
import Timeline from '../components/Profile/Timeline';
import MediaGallery from '../components/Profile/MediaGallery';
import FactList from '../components/Profile/FactList';
import RelationshipManager from '../components/Profile/RelationshipManager';
import Tabs from '../components/Layout/Tabs';

export default function Profile() {
  const { id } = useParams();
  const { data: people, isLoading } = usePeople();
  const [activeTab, setActiveTab] = useState('Details');

  const person = people?.find(p => String(p.id) === String(id));

  if (isLoading) return <p>Loading profile...</p>;
  if (!person) return <p className="text-center text-gray-500">Person not found.</p>;

  const tabs = [
    { name: 'Details', component: <><ProfileDetails user={person} /><FactList facts={person?.facts} /></> },
    { name: 'Timeline', component: <Timeline events={person?.timeline_events} /> },
    { name: 'Media', component: <MediaGallery media={person?.media} /> },
    { name: 'Relationships', component: <RelationshipManager person={person} /> },
  ];

  const activeComponent = tabs.find(tab => tab.name === activeTab)?.component;

  return (
    <>
      <PageHeader title={person.full_name || person.name} subtitle={person?.short_bio || 'View and manage this person\'s information.'} />
      <div className="max-w-4xl mx-auto py-10 sm:px-6 lg:px-8">
        <ProfileHeader user={person} />
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
