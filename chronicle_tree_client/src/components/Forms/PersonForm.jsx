import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';

const PersonForm = ({ person, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (person) {
      setValue('firstName', person.first_name);
      setValue('lastName', person.last_name);
      setValue('birthDate', person.birth_date);
      setValue('deathDate', person.death_date);
      setValue('gender', person.gender);
    }
  }, [person, setValue]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="First Name"
        name="firstName"
        register={register}
        rules={{ required: 'First name is required' }}
        error={errors.firstName}
      />
      <Input
        label="Last Name"
        name="lastName"
        register={register}
        rules={{ required: 'Last name is required' }}
        error={errors.lastName}
      />
      <Input
        label="Birth Date"
        name="birthDate"
        type="date"
        register={register}
      />
      <Input
        label="Death Date"
        name="deathDate"
        type="date"
        register={register}
      />
       <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          {...register('gender')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} disabled={isSubmitting} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default PersonForm;
