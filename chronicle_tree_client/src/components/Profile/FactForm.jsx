import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/api';
import Button from '../UI/Button';

const FACT_TYPE_OPTIONS = [
  'Occupation',
  'Hobby',
  'Residence',
  'School',
  'Military Service',
  'Custom',
];

export default function FactForm({ personId, fact, onFactAdded, onFactUpdated, onCancel }) {
  const isEdit = !!fact;
  // Determine if the label is custom
  const isLabelCustom = fact && fact.label && !FACT_TYPE_OPTIONS.includes(fact.label);
  // State for select and custom label
  const [factType, setFactType] = useState(isLabelCustom ? 'Custom' : (fact?.label || 'Occupation'));
  const [customLabel, setCustomLabel] = useState(isLabelCustom ? fact.label : '');
  const [value, setValue] = useState(fact?.value || '');
  const [date, setDate] = useState(fact?.date || '');
  const [location, setLocation] = useState(fact?.location || '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: fact || {},
  });

  // Handle dropdown change
  const handleFactTypeChange = (e) => {
    const selected = e.target.value;
    setFactType(selected);
    if (selected !== 'Custom') {
      setCustomLabel(''); // Clear custom label when switching to standard type
    }
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      const labelToSend = factType === 'Custom' ? customLabel.trim() : factType;
      if (!labelToSend) {
        setError('Please enter a Fact Type.');
        setSubmitting(false);
        return;
      }
      let response;
      if (isEdit) {
        response = await api.put(`/facts/${fact.id}`, {
          fact: { label: labelToSend, value, date, location }
        });
        onFactUpdated && onFactUpdated(response.data);
      } else {
        response = await api.post(`/people/${personId}/facts`, {
          fact: { label: labelToSend, value, date, location }
        });
        onFactAdded && onFactAdded(response.data);
        setFactType('Occupation');
        setCustomLabel('');
        setValue('');
        setDate('');
        setLocation('');
      }
    } catch (err) {
      setError('Unable to save fact. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">{isEdit ? 'Edit Fact' : 'Add a New Fact'}</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700">Fact Type</label>
          <select
            id="label"
            value={factType}
            onChange={handleFactTypeChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {FACT_TYPE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {factType === 'Custom' && (
            <input
              type="text"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter custom fact type"
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              autoFocus
            />
          )}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input type="text" id="date" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g., 1 Jan 1900" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., London, England" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value / Description</label>
          <textarea id="value" value={value} onChange={e => setValue(e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" onClick={onCancel} disabled={submitting} variant="grey">
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : (isEdit ? 'Save' : 'Add')}
        </Button>
      </div>
    </form>
  );
}
