import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../UI/Button';

const LABELS = {
  parent: 'Select Parent',
  child: 'Select Child',
  spouse: 'Select Spouse',
  sibling: 'Select Sibling',
};

const RelationshipForm = ({ people = [], type, onSubmit, onCancel, isLoading, forceEx, selectedPerson, allPeople = [] }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleFormSubmit = (data) => {
    onSubmit({ 
      selectedId: data.selectedId,
      relationshipType: type,
      is_ex: type === 'spouse' ? (forceEx ? true : !!data.is_ex) : undefined 
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Selected Person - Hidden from UI, automatically set to current profile person */}
      <div className="hidden">
        <input type="hidden" value={selectedPerson?.id || ''} {...register('selectedPersonId')} />
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Selected Person:</span> {selectedPerson?.first_name} {selectedPerson?.last_name}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Adding {LABELS[type].toLowerCase().replace('select ', '')} relationship for this person.
        </p>
      </div>
      
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
        {people.length === 0 && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">No eligible people found</p>
            <p className="text-xs text-yellow-700 mt-1">
              People may be filtered out due to:
              <br />• Blood relationship restrictions (siblings, cousins, etc. cannot marry or have shared children)
              <br />• Age constraints (12+ year gap for parent-child relationships)
              <br />• Existing relationships (max 2 parents, 1 current spouse)
              <br />• Relationship logic (parents cannot be siblings with their children)
            </p>
          </div>
        )}
        {people.length > 0 && allPeople.length > people.length + 1 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-700">
              <span className="font-medium">{allPeople.length - people.length - 1} people filtered out</span> due to relationship constraints, blood relationships, or age requirements.
            </p>
          </div>
        )}
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
        <Button type="button" onClick={onCancel} disabled={isLoading} variant="grey">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} variant="primary">
          {isLoading ? 'Saving...' : 'Add'}
        </Button>
      </div>
    </form>
  );
};

export default RelationshipForm;
