import React, { useState } from 'react';
import api from '../../api/api';
import { FaBookOpen, FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import Button from '../UI/Button';

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
        const response = await api.patch(`/people/${person.id}/note`, { note: { content: notes } });
        setNotes(response.data.content);
        if (onNotesUpdated) onNotesUpdated(response.data.content);
      } else {
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
    <section className="bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
      <div className="flex justify-between items-center pb-2 border-b mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaBookOpen className="text-blue-400" /> Notes & Stories
        </h2>
        {!editing && (
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow transition"
            title="Edit Notes"
            onClick={handleEdit}
            aria-label="Edit Notes & Stories"
          >
            <FaPencilAlt className="text-lg" />
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <textarea
            className="w-full p-2 border rounded-md mb-2"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={5}
            disabled={saving}
          />
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" onClick={handleCancel} variant="grey" disabled={saving}>
              <FaTimes /> Cancel
            </Button>
            <Button type="button" onClick={handleSave} variant="primary" disabled={saving}>
              <FaSave /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="whitespace-pre-line text-gray-800 min-h-[60px]">{notes ? notes : <span className="text-gray-400">No notes yet.</span>}</div>
      )}
    </section>
  );
}
