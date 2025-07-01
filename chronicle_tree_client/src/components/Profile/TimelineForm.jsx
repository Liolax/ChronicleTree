import React, { useState } from 'react';
import api from '../../api/api';

export default function TimelineForm({ personId, event, onEventAdded, onEventUpdated, onCancel }) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || '');
  const [description, setDescription] = useState(event?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (event && event.id) {
        // Update
        const res = await api.put(`/timeline_items/${event.id}`, { timeline_item: { title, date, description } });
        onEventUpdated && onEventUpdated(res.data);
      } else {
        // Create
        const res = await api.post(`/people/${personId}/timeline_items`, { timeline_item: { title, date, description } });
        onEventAdded && onEventAdded(res.data);
      }
    } catch (err) {
      setError('Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">{event ? 'Edit' : 'Add'} Timeline Event</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border rounded p-2" rows={3} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
