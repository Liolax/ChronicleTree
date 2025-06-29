import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';

const RELATIONSHIP_TYPES = [
  { value: '', label: 'Relationship Type' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'spouse', label: 'Spouse' },
];

const PersonForm = ({ person, onSubmit, onCancel, isLoading, people = [] }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (person) {
      reset({
        firstName: person.first_name || '',
        lastName: person.last_name || '',
        birthDate: person.birth_date || '',
        deathDate: person.death_date || '',
        gender: person.gender || '',
        isDeceased: !!person.is_deceased,
        relationType: '',
        relatedPersonId: '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        birthDate: '',
        deathDate: '',
        gender: '',
        isDeceased: false,
        relationType: '',
        relatedPersonId: '',
      });
    }
  }, [person, reset]);

  const isDeceased = watch('isDeceased');
  useEffect(() => {
    if (!isDeceased) setValue('deathDate', '');
  }, [isDeceased, setValue]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const relationType = watch('relationType');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="First Name"
        id="firstName"
        placeholder="Enter first name"
        {...register('firstName', { required: 'First name is required' })}
        error={errors.firstName}
      />
      <Input
        label="Last Name"
        id="lastName"
        placeholder="Enter last name"
        {...register('lastName', { required: 'Last name is required' })}
        error={errors.lastName}
      />
      <Input
        label="Birth Date"
        id="birthDate"
        type="date"
        {...register('birthDate', { required: 'Birth date is required' })}
        error={errors.birthDate}
      />
      <div className="flex items-center">
        <input
          id="isDeceased"
          type="checkbox"
          {...register('isDeceased')}
          className="h-4 w-4 rounded mr-2"
        />
        <label htmlFor="isDeceased" className="text-sm">Deceased</label>
      </div>
      <Input
        label="Death Date"
        id="deathDate"
        type="date"
        {...register('deathDate')}
        disabled={!isDeceased}
        error={errors.deathDate}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          {...register('gender', { required: 'Gender is required' })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select Gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Relationship Type</label>
        <select
          {...register('relationType')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {RELATIONSHIP_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {relationType && relationType !== '' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Related Person</label>
          <select
            {...register('relatedPersonId')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Person</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.full_name || `${p.first_name} ${p.last_name}`}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} disabled={isSubmitting || isLoading} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default PersonForm;
