import React, { useState } from 'react';
import api from '../../api/api';
import { FaFlag, FaBirthdayCake, FaGraduationCap, FaBriefcase, FaHome, FaHeart, FaStar, FaPlane, FaTrophy } from 'react-icons/fa';
import Button from '../UI/Button'; // Adjust the import path as necessary

const ICONS = [
  { name: 'Flag', icon: <FaFlag /> },
  { name: 'Birthday', icon: <FaBirthdayCake /> },
  { name: 'Graduation', icon: <FaGraduationCap /> },
  { name: 'Work', icon: <FaBriefcase /> },
  { name: 'Home', icon: <FaHome /> },
  { name: 'Love', icon: <FaHeart /> },
  { name: 'Star', icon: <FaStar /> },
  { name: 'Travel', icon: <FaPlane /> },
  { name: 'Trophy', icon: <FaTrophy /> },
];

export default function TimelineForm({ personId, event, onEventAdded, onEventUpdated, onCancel }) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || '');
  const [description, setDescription] = useState(event?.description || '');
  const [icon, setIcon] = useState(event?.icon || 'Flag');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!event;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const res = await api.put(`/timeline_items/${event.id}`, { timeline_item: { title, date, description, icon } });
        onEventUpdated && onEventUpdated(res.data);
      } else {
        const res = await api.post(`/people/${personId}/timeline_items`, { timeline_item: { title, date, description, icon } });
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
      <h3 className="text-xl font-semibold mb-2">{isEdit ? 'Edit Timeline Event' : 'Add Timeline Event'}</h3>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(opt => (
            <button
              type="button"
              key={opt.name}
              className={`p-2 rounded-full border-2 ${icon === opt.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center justify-center text-lg`}
              onClick={() => setIcon(opt.name)}
              title={opt.name}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onCancel} variant="grey" disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Saving...' : (isEdit ? 'Save' : 'Add')}</Button>
      </div>
    </form>
  );
}
