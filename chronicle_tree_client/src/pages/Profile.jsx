import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePeople } from '../services/people';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileDetails from '../components/Profile/ProfileDetails';
import FactList from '../components/Profile/FactList';
import Timeline from '../components/Profile/Timeline';
import MediaGallery from '../components/Profile/MediaGallery';
import RelationshipManager from '../components/Profile/RelationshipManager';
import FactForm from '../components/Profile/FactForm';
import TimelineForm from '../components/Profile/TimelineForm';
import MediaForm from '../components/Profile/MediaForm';
import api from '../api/api';
import { deletePerson, createRelationship } from '../services/people';
import Notes from '../components/Profile/Notes';

export default function Profile() {
  const { id } = useParams();
  const { data: people, isLoading } = usePeople();
  const [showEditPic, setShowEditPic] = useState(false);
  const [showAddFact, setShowAddFact] = useState(false);
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);

  // Find person after people are loaded
  const person = people?.find(p => String(p.id) === String(id));

  // State for facts, timeline, media (initialized after person is loaded)
  const [facts, setFacts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [media, setMedia] = useState([]);

  // Sync facts/timeline/media state when person changes
  React.useEffect(() => {
    if (person) {
      setFacts(person.key_facts || []);
      setTimeline(person.timeline_events || []);
      setMedia(person.media || []);
    }
  }, [person]);

  if (isLoading) return <p>Loading profile...</p>;
  if (!person) return <p className="text-center text-gray-500">Person not found.</p>;

  // Helper for age
  const getAge = dob => {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  // Add fact handler
  const handleFactAdded = (newFact) => {
    setFacts(prev => [...prev, newFact]);
    setShowAddFact(false);
  };

  // Edit fact handler
  const handleFactEdit = (fact) => {
    setEditingFact(fact);
    setShowAddFact(true);
  };

  // Update fact handler
  const handleFactUpdated = (updatedFact) => {
    setFacts(prev => prev.map(f => f.id === updatedFact.id ? updatedFact : f));
    setEditingFact(null);
    setShowAddFact(false);
  };

  // Delete fact handler
  const handleFactDelete = async (factId) => {
    if (!window.confirm('Delete this fact?')) return;
    await api.delete(`/facts/${factId}`);
    setFacts(prev => prev.filter(f => f.id !== factId));
  };

  // Add timeline event handler
  const handleTimelineAdded = (newEvent) => {
    setTimeline(prev => [...prev, newEvent]);
    setShowAddTimeline(false);
  };

  // Edit timeline event handler
  const handleTimelineEdit = (event) => {
    setEditingTimeline(event);
    setShowAddTimeline(true);
  };

  // Update timeline event handler
  const handleTimelineUpdated = (updatedEvent) => {
    setTimeline(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setEditingTimeline(null);
    setShowAddTimeline(false);
  };

  // Delete timeline event handler
  const handleTimelineDelete = async (eventId) => {
    if (!window.confirm('Delete this timeline event?')) return;
    await api.delete(`/timeline_items/${eventId}`);
    setTimeline(prev => prev.filter(e => e.id !== eventId));
  };

  // Add media handler
  const handleMediaAdded = (newMedia) => {
    setMedia(prev => [...prev, newMedia]);
    setShowAddMedia(false);
    setEditingMedia(null);
  };

  // Edit media handler
  const handleMediaEdit = (mediaItem) => {
    setEditingMedia(mediaItem);
    setShowAddMedia(true);
  };

  // Update media handler
  const handleMediaUpdated = (updatedMedia) => {
    setMedia(prev => prev.map(m => m.id === updatedMedia.id ? updatedMedia : m));
    setShowAddMedia(false);
    setEditingMedia(null);
  };

  // Delete media handler
  const handleMediaDelete = async (mediaId) => {
    if (!window.confirm('Delete this media item?')) return;
    await api.delete(`/media/${mediaId}`);
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  // Relationship delete handler
  const handleRelationshipDeleted = () => {
    window.location.reload();
  };

  // Notes update handler
  const handleNotesUpdated = (newNotes) => {
    // Optionally update person.note in state if needed
    if (person && newNotes && newNotes.content !== undefined) {
      person.note = { ...person.note, content: newNotes.content };
    }
  };

  return (
    <main className="max-w-6xl mx-auto my-10 p-4">
      {/* Sticky header for profile name and share */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sticky top-0 z-30 bg-white/90 py-4 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-app-primary flex items-center gap-3">
          {person.full_name || person.name}
          {person.is_deceased && <span className="ml-2 text-xs text-gray-400">Deceased</span>}
        </h1>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition mt-4 sm:mt-0"
          onClick={() => setShowShare(true)}
          aria-label="Share profile"
        >
          <i className="fas fa-share-alt" /> Share
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Picture and Key Facts */}
        <aside className="lg:col-span-1 flex flex-col items-center space-y-6">
          <div className="relative group">
            <img
              className="w-48 h-48 rounded-full object-cover shadow-lg border-4 border-white"
              src={person.profile_picture || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={person.full_name || person.name}
            />
            <button
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowEditPic(true)}
              aria-label="Edit profile picture"
            >
              <i className="fas fa-camera text-white text-4xl"></i>
            </button>
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-500 flex items-center justify-center gap-2">
              {person.date_of_birth && !person.is_deceased && (
                <span>{getAge(person.date_of_birth)} y.o.</span>
              )}
              {person.gender === 'Female' ? (
                <i className="fas fa-venus text-pink-500"></i>
              ) : person.gender === 'Male' ? (
                <i className="fas fa-mars text-blue-500"></i>
              ) : null}
            </p>
          </div>
          <div className="w-full bg-slate-50 rounded-lg p-4 shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Key Facts</h3>
              <button className="text-gray-700 hover:text-blue-600" onClick={() => { setEditingFact(null); setShowAddFact(true); }} title="Add Key Fact">
                <i className="fas fa-plus-circle"></i> Add
              </button>
            </div>
            <FactList facts={facts} onEdit={handleFactEdit} onDelete={handleFactDelete} />
          </div>
        </aside>

        {/* Right Columns: Details, Timeline, Notes, Media, Relationships */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <section className="details-section bg-slate-50 rounded-lg p-6 shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b mb-4">
              <h2 className="text-2xl font-semibold">Basic Information</h2>
              <button className="text-gray-700 hover:text-blue-600" title="Edit Details">
                <i className="fas fa-pencil-alt"></i> Edit
              </button>
            </div>
            <ProfileDetails person={person} />
          </section>

          {/* Timeline */}
          <section className="bg-slate-50 rounded-lg p-6 shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b mb-4">
              <h2 className="text-2xl font-semibold">Life Timeline</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md flex items-center" onClick={() => { setEditingTimeline(null); setShowAddTimeline(true); }}>
                <i className="fas fa-plus mr-2"></i>Add Milestone
              </button>
            </div>
            <Timeline events={timeline} onEdit={handleTimelineEdit} onDelete={handleTimelineDelete} />
          </section>

          {/* Notes & Stories */}
          <Notes person={person} onNotesUpdated={handleNotesUpdated} />

          {/* Media Gallery */}
          <section className="bg-slate-50 rounded-lg p-6 shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b mb-4">
              <h2 className="text-2xl font-semibold">Media Gallery</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md flex items-center" onClick={() => { setEditingMedia(null); setShowAddMedia(true); }}>
                <i className="fas fa-plus mr-2"></i>Add Media
              </button>
            </div>
            <MediaGallery media={media} onEdit={handleMediaEdit} onDelete={handleMediaDelete} />
          </section>

          {/* Relationships */}
          <section className="bg-slate-50 rounded-lg p-6 shadow-inner">
            <RelationshipManager
              person={person}
              people={people}
              onRelationshipAdded={() => window.location.reload()}
              onRelationshipDeleted={handleRelationshipDeleted}
            />
          </section>
        </div>
      </div>

      {/* Modals (placeholders) */}
      {showEditPic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Profile Picture</h3>
            <p>Profile picture upload UI goes here.</p>
            <div className="flex justify-end mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded mr-2" onClick={() => setShowEditPic(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
      {showAddFact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <FactForm
              personId={person.id}
              fact={editingFact}
              onFactAdded={handleFactAdded}
              onFactUpdated={handleFactUpdated}
              onCancel={() => { setShowAddFact(false); setEditingFact(null); }}
            />
          </div>
        </div>
      )}
      {showAddTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <TimelineForm
              personId={person.id}
              event={editingTimeline}
              onEventAdded={handleTimelineAdded}
              onEventUpdated={handleTimelineUpdated}
              onCancel={() => { setShowAddTimeline(false); setEditingTimeline(null); }}
            />
          </div>
        </div>
      )}
      {showAddMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <MediaForm
              personId={person.id}
              mediaItem={editingMedia}
              onMediaAdded={handleMediaAdded}
              onMediaUpdated={handleMediaUpdated}
              onCancel={() => { setShowAddMedia(false); setEditingMedia(null); }}
            />
          </div>
        </div>
      )}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share Profile</h3>
            <div className="bg-gray-100 p-4 rounded-lg text-center mb-4">
              <i className="fas fa-user-circle text-6xl text-gray-300"></i>
              <p className="mt-2 font-semibold">Snapshot of {person.full_name || person.name}'s Profile</p>
            </div>
            <textarea className="w-full p-2 border rounded-md mb-4" placeholder="Add an optional caption..."></textarea>
            <div className="flex justify-center space-x-4 mt-4">
              <button className="text-2xl text-blue-600 hover:text-blue-800" title="Share on Facebook"><i className="fab fa-facebook-square"></i></button>
              <button className="text-2xl text-black hover:text-gray-700" title="Share on X"><i className="fab fa-x-twitter"></i></button>
              <button className="text-2xl text-green-500 hover:text-green-700" title="Share on WhatsApp"><i className="fab fa-whatsapp-square"></i></button>
              <button className="text-2xl text-red-500 hover:text-red-700" title="Share via Email"><i className="fas fa-envelope-square"></i></button>
              <button className="text-2xl text-gray-600 hover:text-gray-800" title="Copy Link"><i className="fas fa-link"></i></button>
            </div>
            <div className="flex justify-end mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowShare(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
