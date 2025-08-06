import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePeople, getPerson, useDeletePerson, useToggleSpouseEx } from '../services/people';
import FactList from '../components/Profile/FactList';
import Timeline from '../components/Profile/Timeline';
import MediaGallery from '../components/Profile/MediaGallery';
import RelationshipManager from '../components/Profile/RelationshipManager';
import FactForm from '../components/Profile/FactForm';
import TimelineForm from '../components/Profile/TimelineForm';
import MediaForm from '../components/Profile/MediaForm';
import api from '../api/api';
import Notes from '../components/Profile/Notes';
import ProfileDetails from '../components/Profile/ProfileDetails';
import DeletePersonModal from '../components/UI/DeletePersonModal';
import { ProfileLoader } from '../components/UI/PageLoader';
import Button from '../components/UI/Button';
import { FaInfoCircle, FaPlus, FaIdCardAlt, FaPencilAlt, FaStream, FaImages, FaShareAlt, FaCamera, FaUserCircle, FaEnvelopeSquare, FaLink, FaVenus, FaMars, FaFacebookSquare, FaTwitter, FaWhatsappSquare, FaTrash } from 'react-icons/fa';
import { ShareModal } from '../components/Share';
import { showFileError, showOperationError, showOperationSuccess } from '../utils/validationAlerts';
import { showDeleteConfirm } from '../utils/sweetAlerts';

export default function Profile() {
  const { id } = useParams();
  const { data: people, isLoading } = usePeople();
  const deletePersonMutation = useDeletePerson();
  const toggleSpouseExMutation = useToggleSpouseEx();
  const [showEditPic, setShowEditPic] = useState(false);
  const [showAddFact, setShowAddFact] = useState(false);
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePersonData, setDeletePersonData] = useState(null);
  const [deleteRelationships, setDeleteRelationships] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  // Find person after people are loaded
  const person = people?.find(p => String(p.id) === String(id));
  // Find profile id if available
  const profileId = person?.profile_id || (person?.profile && person.profile.id);

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

  if (isLoading) return <ProfileLoader />;
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
    const result = await showDeleteConfirm(
      'Delete Fact',
      'Are you sure you want to delete this fact? This action cannot be undone.'
    );
    
    if (!result.isConfirmed) return;
    
    try {
      await api.delete(`/facts/${factId}`);
      setFacts(prev => prev.filter(f => f.id !== factId));
      showOperationSuccess('Fact deleted successfully');
    } catch (error) {
      console.error('Delete fact error:', error);
      showOperationError('Failed to delete fact');
    }
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
    const result = await showDeleteConfirm(
      'Delete Timeline Event',
      'Are you sure you want to delete this timeline event? This action cannot be undone.'
    );
    
    if (!result.isConfirmed) return;
    
    try {
      await api.delete(`/timeline_items/${eventId}`);
      setTimeline(prev => prev.filter(e => e.id !== eventId));
      showOperationSuccess('Timeline event deleted successfully');
    } catch (error) {
      console.error('Delete timeline error:', error);
      showOperationError('Failed to delete timeline event');
    }
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
    const result = await showDeleteConfirm(
      'Delete Media',
      'Are you sure you want to delete this media item? This action cannot be undone.'
    );
    
    if (!result.isConfirmed) return;
    
    try {
      await api.delete(`/media/${mediaId}`);
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      showOperationSuccess('Media deleted successfully');
    } catch (error) {
      console.error('Delete media error:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Failed to delete media. Please try again.';
      showOperationError(errorMsg);
    }
  };

  // Relationship delete handler
  const handleRelationshipDeleted = () => {
    window.location.reload();
  };

  // Notes update handler
  const handleNotesUpdated = (newNotes) => {
    if (person && newNotes && newNotes.content !== undefined) {
      person.note = { ...person.note, content: newNotes.content };
    }
  };

  // --- Refactored Layout ---
  const handlePersonUpdated = updated => {
    Object.assign(person, updated); // update local person object
    setEditingDetails(false);
  };

  // Group relationships for DeletePersonModal
  function groupRelationships(person) {
    const groups = { Parents: [], Children: [], Spouses: [], Siblings: [] };
    if (person?.relatives) {
      person.relatives.forEach(rel => {
        if (rel.relationship_type === 'parent') groups.Parents.push(rel);
        if (rel.relationship_type === 'child') groups.Children.push(rel);
        if (rel.relationship_type === 'spouse') groups.Spouses.push(rel);
        if (rel.relationship_type === 'sibling') groups.Siblings.push(rel);
      });
    }
    return groups;
  }

  // Handler to open DeletePersonModal
  const handleOpenDeleteModal = async () => {
    // Fetch full person with relationships
    const data = await getPerson(person.id);
    setDeletePersonData(data);
    setDeleteRelationships(groupRelationships(data));
    setShowDeleteModal(true);
  };

  // Handler to confirm deletion
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePersonMutation.mutateAsync(person.id);
      window.location.href = '/'; // Redirect to home/tree after deletion
    } catch (err) {
      showOperationError('deleteFailed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler to toggle ex/current spouse in DeletePersonModal
  const handleToggleSpouseEx = async (relationshipId) => {
    if (!relationshipId) return;
    try {
      const resp = await toggleSpouseExMutation.mutateAsync(relationshipId);
      // Refresh the person and relationships for the modal
      const data = await getPerson(person.id);
      setDeletePersonData(data);
      setDeleteRelationships(groupRelationships(data));
    } catch (err) {
      showOperationError('updateFailed');
    }
  };

  // Sharing functions
  const handleCloseShareModal = () => {
    setShowShare(false);
    setShareCaption('');
  };

  const handleSocialShareClick = async (platform) => {
    try {
      const shareContent = generateProfileShareContent(person.id, shareCaption);
      await handleSocialShare(platform, shareContent);
      
      if (platform === 'copy') {
        // Show success message for copy
        showOperationSuccess('linkCopied');
      }
    } catch (error) {
      showOperationError('shareFailed', { message: error.message });
    }
  };

  return (
    <main className="max-w-6xl mx-auto my-6 md:my-10 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left column: Profile summary */}
        <div className="flex flex-col gap-8">
          {/* Name, Age, Share, Avatar */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                {person.avatar_url ? (
                  <img
                    src={person.avatar_url}
                    alt={person.full_name || person.name}
                    className="w-24 h-24 md:w-20 md:h-20 rounded-full object-cover border-2 border-blue-200 shadow"
                  />
                ) : (
                  <FaUserCircle className="w-24 h-24 md:w-20 md:h-20 text-gray-300 border-2 border-blue-200 rounded-full bg-white shadow" />
                )}
                <button
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 md:p-2 shadow hover:bg-blue-700 transition-opacity opacity-80 group-hover:opacity-100"
                  onClick={() => setShowEditPic(true)}
                  title="Edit Profile Picture"
                  aria-label="Edit Profile Picture"
                >
                  <FaCamera className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col gap-2 text-center sm:text-left min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-app-primary break-words leading-tight">
                  {person.full_name || person.name}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-gray-500">
                  {person.date_of_birth && !person.date_of_death && (
                    <span className="text-sm md:text-base">{getAge(person.date_of_birth)} y.o.</span>
                  )}
                  {person.gender === 'Female' ? (
                    <FaVenus className="text-pink-500" />
                  ) : person.gender === 'Male' ? (
                    <FaMars className="text-blue-500" />
                  ) : null}
                  {person.date_of_death && (
                    <span className="text-xs md:text-sm text-gray-400">
                      Deceased ({new Date(person.date_of_death).getFullYear()})
                    </span>
                  )}
                </div>
                
                <div className="flex justify-center sm:justify-start mt-2">
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm md:text-base"
                    onClick={() => setShowShareModal(true)}
                    aria-label="Share profile"
                  >
                    <FaShareAlt /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Key Facts */}
          <section className="w-full bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold tracking-wide flex items-center gap-2">
                <FaInfoCircle className="text-blue-400" /> Key Facts
              </h3>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow transition"
                onClick={() => { setEditingFact(null); setShowAddFact(true); }}
                title="Add Key Fact"
                aria-label="Add Key Fact"
              >
                <FaPlus className="text-lg" />
              </button>
            </div>
            <FactList facts={facts} onEdit={handleFactEdit} onDelete={handleFactDelete} />
          </section>
          {/* Relationships */}
          <RelationshipManager
            person={person}
            people={people}
            onRelationshipAdded={() => window.location.reload()}
            onRelationshipDeleted={handleRelationshipDeleted}
          />
        </div>
        {/* Right column: Details and Notes */}
        <div className="flex flex-col gap-8">
          {/* Basic Info */}
          <section className="bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b mb-4">
              <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
                <FaIdCardAlt className="text-blue-400" /> Basic Information
              </h2>
              {editingDetails ? null : (
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow transition"
                  title="Edit Details"
                  onClick={() => setEditingDetails(true)}
                  aria-label="Edit Basic Information"
                >
                  <FaPencilAlt className="text-lg" />
                </button>
              )}
            </div>
            <ProfileDetails person={person} editing={editingDetails} onPersonUpdated={updated => {
              Object.assign(person, updated);
              setEditingDetails(false);
            }} />
          </section>
          {/* Life Timeline (moved here) */}
          <section className="w-full bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold tracking-wide flex items-center gap-2">
                <FaStream className="text-blue-400" /> Life Timeline
              </h3>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow transition"
                onClick={() => { setEditingTimeline(null); setShowAddTimeline(true); }}
                title="Add Milestone"
                aria-label="Add Milestone"
              >
                <FaPlus className="text-lg" />
              </button>
            </div>
            <Timeline events={timeline} onEdit={handleTimelineEdit} onDelete={handleTimelineDelete} compact />
          </section>
          {/* Notes & Stories */}
          <Notes person={person} onNotesUpdated={handleNotesUpdated} />
          {/* Media Gallery */}
          <section className="bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold tracking-wide flex items-center gap-2">
                <FaImages className="text-blue-400" /> Media Gallery
              </h3>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow transition"
                onClick={() => { setEditingMedia(null); setShowAddMedia(true); }}
                title="Add Media"
                aria-label="Add Media"
              >
                <FaPlus className="text-lg" />
              </button>
            </div>
            <MediaGallery media={media} onEdit={handleMediaEdit} onDelete={handleMediaDelete} />
          </section>
        </div>
      </div>
      {/* Modals (placeholders) */}
      {showEditPic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Profile Picture</h3>
            <p className="text-sm text-gray-500 mb-2">Accepted file types: JPG, PNG, GIF. Max size: 2MB.</p>
            <form
              onSubmit={async e => {
                e.preventDefault();
                const file = e.target.avatar.files[0];
                if (!file) return;
                if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                  showFileError('invalidType');
                  return;
                }
                if (file.size > 2 * 1024 * 1024) {
                  showFileError('fileTooLarge');
                  return;
                }
                const formData = new FormData();
                formData.append('profile[avatar]', file);
                try {
                  await api.patch(`/profiles/${profileId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                  window.location.reload();
                } catch (err) {
                  showFileError('uploadFailed');
                }
              }}
            >
              <input
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/gif"
                className="block w-full mb-4 border rounded p-2"
                required
              />
              {person.avatar_url && (
                <button
                  type="button"
                  className="mb-4 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                  onClick={async () => {
                    const result = await showDeleteConfirm(
                      'Remove Profile Picture?',
                      'This will permanently remove the profile picture. This action cannot be undone.'
                    );
                    if (result.isConfirmed) {
                      try {
                        await api.patch(`/profiles/${profileId}`, { profile: { avatar: null } });
                        window.location.reload();
                      } catch (err) {
                        showFileError('removeFailed');
                      }
                    }
                  }}
                >
                  Remove Current Picture
                </button>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowEditPic(false)} variant="grey">Cancel</Button>
                <Button type="submit" variant="primary">Save</Button>
              </div>
            </form>
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
      { (showAddMedia || editingMedia) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <MediaForm
              personId={person.id}
              media={editingMedia}
              onMediaAdded={handleMediaAdded}
              onMediaUpdated={handleMediaUpdated}
              onCancel={() => { setShowAddMedia(false); setEditingMedia(null); }}
            />
          </div>
        </div>
      )}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        personId={person.id}
        shareType="profile"
      />
      {showDeleteModal && deletePersonData && (
        <DeletePersonModal
          person={deletePersonData}
          relationships={deleteRelationships}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
          onToggleSpouseEx={handleToggleSpouseEx}
        />
      )}
    </main>
  );
}
