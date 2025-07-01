import React, { useState } from 'react';
import api from '../../api/api';

export default function Notes({ person, onNotesUpdated }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(person?.note?.content || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setNotes(person?.note?.content || '');
    setEditing(false);
    setError(null);
  };
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (person.note && person.note.id) {
        // Update existing note
        const response = await api.patch(`/people/${person.id}/note`, { note: { content: notes } });
        setNotes(response.data.content);
        if (onNotesUpdated) onNotesUpdated(response.data.content);
      } else {
        // Create new note
        const response = await api.post(`/people/${person.id}/note`, { note: { content: notes } });
        setNotes(response.data.content);
        if (onNotesUpdated) onNotesUpdated(response.data.content);
      }
      setEditing(false);
    } catch (err) {
      setError('Failed to save notes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="details-section" id="notesSection">
      <div className="flex justify-between items-center pb-2 border-b mb-4">
        <h2 className="text-2xl font-semibold">Notes & Stories</h2>
        {!editing && (
          <button className="view-mode text-app-primary hover:text-link-hover" onClick={handleEdit}>
            <i className="fas fa-pencil-alt"></i> Edit
          </button>
        )}
        {editing && (
          <div className="edit-mode space-x-2">
            <button className="bg-button-primary hover:bg-button-primary-hover text-white font-semibold py-1 px-3 rounded-md transition-colors" onClick={handleSave} disabled={saving}>
              Save
            </button>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded-md transition-colors" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {!editing ? (
        <p className="text-gray-800 whitespace-pre-line">{notes || 'No notes available.'}</p>
      ) : (
        <textarea
          className="w-full border rounded p-2 min-h-[120px]"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={saving}
        />
      )}
    </section>
  );
}
