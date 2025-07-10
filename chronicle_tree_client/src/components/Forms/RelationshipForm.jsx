import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../UI/Button';

const LABELS = {
  parent: 'Select Parent',
  child: 'Select Child',
  spouse: 'Select Spouse',
  sibling: 'Select Sibling',
};

const RelationshipForm = ({ people = [], type, onSubmit, onCancel, isLoading, forceEx }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(data => onSubmit({ selectedId: data.selectedId, is_ex: type === 'spouse' ? (forceEx ? true : !!data.is_ex) : undefined }))} className="space-y-4">
      <div>
        <label htmlFor="selectedId" className="block text-sm font-medium text-gray-700">{LABELS[type]}</label>
        <select
          id="selectedId"
          {...register('selectedId', { required: `Please select a ${type}` })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">{LABELS[type]}</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        {errors.selectedId && <p className="mt-2 text-sm text-red-600">{errors.selectedId.message}</p>}
      </div>
      {type === 'spouse' && (
        <div>
          <label className="inline-flex items-center">
            <input type="checkbox" {...register('is_ex')} className="form-checkbox" checked={forceEx ? true : undefined} disabled={forceEx} />
            <span className="ml-2 text-red-500">Mark as ex-spouse</span>
          </label>
          {forceEx && <span className="ml-2 text-xs text-gray-500">(Current spouse exists, only ex-spouse can be added)</span>}
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} disabled={isLoading} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Add'}
        </Button>
      </div>
    </form>
  );
};

export default RelationshipForm;
