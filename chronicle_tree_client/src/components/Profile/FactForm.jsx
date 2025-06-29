import React, { useState } from 'react';
import api from '../../api/api';

export default function FactForm({ personId, onFactAdded }) {
  const [factType, setFactType] = useState('Birth');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post(`/people/${personId}/facts`, {
        fact: { fact_type: factType, date, place, description }
      });
      onFactAdded(response.data); // Callback to update parent state
      // Reset form
      setDate('');
      setPlace('');
      setDescription('');
    } catch (err) {
      setError('Failed to save fact. Please check your input.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Add a New Fact</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="factType" className="block text-sm font-medium text-gray-700">Fact Type</label>
          <select id="factType" value={factType} onChange={e => setFactType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
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
          <input type="text" id="date" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g., 1 Jan 1900" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="place" className="block text-sm font-medium text-gray-700">Place</label>
          <input type="text" id="place" value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g., London, England" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
        </div>
      </div>
      <div className="mt-4">
        <button type="submit" disabled={submitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Fact'}
        </button>
      </div>
    </form>
  );
}
