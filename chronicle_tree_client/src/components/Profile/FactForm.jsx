import React, { useState } from 'react';
import api from '../../api/api';

export default function FactForm({ personId, fact, onFactAdded, onFactUpdated, onCancel }) {
  const isEdit = !!fact;
  const [factType, setFactType] = useState(fact?.fact_type || 'Birth');
  const [date, setDate] = useState(fact?.date || '');
  const [place, setPlace] = useState(fact?.place || '');
  const [description, setDescription] = useState(fact?.description || '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const response = await api.put(`/facts/${fact.id}`, {
          fact: { fact_type: factType, date, place, description }
        });
        onFactUpdated && onFactUpdated(response.data);
      } else {
        const response = await api.post(`/people/${personId}/facts`, {
          fact: { fact_type: factType, date, place, description }
        });
        onFactAdded && onFactAdded(response.data);
        setDate('');
        setPlace('');
        setDescription('');
      }
    } catch (err) {
      setError('Failed to save fact. Please check your input.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">{isEdit ? 'Edit Fact' : 'Add a New Fact'}</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="factType" className="block text-sm font-medium text-gray-700">Fact Type</label>
          <select id="factType" value={factType} onChange={e => setFactType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
            <option>Birth</option>
            <option>Death</option>
            <option>Marriage</option>
            <option>Residence</option>
            <option>Occupation</option>
            <option>Custom</option>
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input type="text" id="date" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g., 1 Jan 1900" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="place" className="block text-sm font-medium text-gray-700">Place</label>
          <input type="text" id="place" value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g., London, England" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" disabled={submitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {submitting ? 'Saving...' : (isEdit ? 'Save Fact' : 'Add Fact')}
        </button>
      </div>
    </form>
  );
}
