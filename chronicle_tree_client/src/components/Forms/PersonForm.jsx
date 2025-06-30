import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { useCurrentUser } from '../../services/users';

const RELATIONSHIP_TYPES = [
  { value: '', label: 'Relationship Type' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'spouse', label: 'Spouse' },
];

const PersonForm = ({ person, onSubmit, onCancel, isLoading, people = [], isFirstPerson = false }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (person) {
      reset({
        firstName: person.first_name || '',
        lastName: person.last_name || '',
        date_of_birth: person.date_of_birth || '',
        date_of_death: person.date_of_death || '',
        gender: person.gender || '',
        isDeceased: !!person.is_deceased,
        relationType: '',
        relatedPersonId: '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        date_of_birth: '',
        date_of_death: '',
        gender: '',
        isDeceased: false,
        relationType: '',
        relatedPersonId: '',
      });
    }
  }, [person, reset]);

  const isDeceased = watch('isDeceased');
  useEffect(() => {
    if (!isDeceased) setValue('date_of_death', '');
  }, [isDeceased, setValue]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const relationType = watch('relationType');

  // Only show people with the same user_id as the current user
  // For test/demo data, if user_id is missing, show all except self
  const filteredPeople = people.filter(p => !person || p.id !== person.id);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[340px] overflow-y-auto">
      {/* Removed form intro and heading for Add Person */}
      {!person && (
        <div className="text-sm text-gray-600 mb-2">Required fields are marked with <span className='text-red-500'>*</span>.</div>
      )}
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
        id="date_of_birth"
        type="date"
        max={new Date().toISOString().split('T')[0]}
        value={watch('date_of_birth') ? watch('date_of_birth').slice(0, 10) : ''}
        {...register('date_of_birth', { required: 'Birth date is required',
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Birth date cannot be in the future';
            return true;
          }
        })}
        error={errors.date_of_birth}
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
        id="date_of_death"
        type="date"
        max={new Date().toISOString().split('T')[0]}
        value={watch('date_of_death') ? watch('date_of_death').slice(0, 10) : ''}
        {...register('date_of_death', {
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Death date cannot be in the future';
            return true;
          }
        })}
        disabled={!isDeceased}
        error={errors.date_of_death}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          id="gender"
          {...register('gender', { required: 'Gender is required' })}
          className="mt-1 block w-full pl-3 pr-10 py-2 border border-app-accent focus:outline-none focus:ring-app-accent focus:border-app-accent sm:text-sm rounded-md bg-white"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message}</span>}
      </div>
      {/* Relationship selection guidance and fields */}
      {/* Only show relationship fields if not first person and there are people to relate to */}
      {!isFirstPerson && filteredPeople.length > 0 && (
        <>
          <div>
            <label htmlFor="relationType" className="block text-sm font-medium text-gray-700">Relationship Type <span className="text-red-500">*</span></label>
            <select
              id="relationType"
              {...register('relationType', { required: 'Relationship type is required' })}
              className="mt-1 block w-full pl-3 pr-10 py-2 border border-app-accent focus:outline-none focus:ring-app-accent focus:border-app-accent sm:text-sm rounded-md bg-white"
              required
            >
              {RELATIONSHIP_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.relationType && <span className="text-red-500 text-xs">{errors.relationType.message}</span>}
          </div>
          {relationType && relationType !== '' && (
            <div>
              <label htmlFor="relatedPersonId" className="block text-sm font-medium text-gray-700">Related Person <span className="text-red-500">*</span></label>
              <select
                id="relatedPersonId"
                {...register('relatedPersonId', { required: 'Related person is required' })}
                className="mt-1 block w-full pl-3 pr-10 py-2 border border-app-accent focus:outline-none focus:ring-app-accent focus:border-app-accent sm:text-sm rounded-md bg-white"
                required
              >
                <option value="">Select Person</option>
                {filteredPeople.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
              {errors.relatedPersonId && <span className="text-red-500 text-xs">{errors.relatedPersonId.message}</span>}
            </div>
          )}
        </>
      )}
      <div className="flex justify-end gap-4 mt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold shadow hover:bg-gray-300 transition-colors">Cancel</button>
        <button type="submit" disabled={isSubmitting || isLoading} className="bg-button-primary text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-button-primary-hover transition-colors">
          {isSubmitting || isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default PersonForm;
