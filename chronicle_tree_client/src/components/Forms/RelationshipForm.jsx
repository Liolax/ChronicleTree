import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../UI/Button';

const RelationshipForm = ({ people = [], relationship, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: relationship || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="person1Id" className="block text-sm font-medium text-gray-700">Person 1</label>
        <select
          id="person1Id"
          {...register('person1Id', { required: 'Please select the first person' })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select Person</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        {errors.person1Id && <p className="mt-2 text-sm text-red-600">{errors.person1Id.message}</p>}
      </div>

      <div>
        <label htmlFor="person2Id" className="block text-sm font-medium text-gray-700">Person 2</label>
        <select
          id="person2Id"
          {...register('person2Id', { required: 'Please select the second person' })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select Person</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        {errors.person2Id && <p className="mt-2 text-sm text-red-600">{errors.person2Id.message}</p>}
      </div>

      <div>
        <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700">Relationship Type</label>
        <select
          id="relationshipType"
          {...register('relationshipType', { required: 'Relationship type is required' })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select Type</option>
          <option value="spouse">Spouse</option>
          <option value="parent">Parent</option>
          <option value="child">Child</option>
          <option value="sibling">Sibling</option>
        </select>
        {errors.relationshipType && <p className="mt-2 text-sm text-red-600">{errors.relationshipType.message}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} disabled={isLoading} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default RelationshipForm;
