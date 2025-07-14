import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';

const EditPersonForm = ({ person, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      firstName: person?.first_name || '',
      lastName: person?.last_name || '',
      birthDate: person?.date_of_birth ? person.date_of_birth.slice(0, 10) : '',
      deathDate: person?.date_of_death ? person.date_of_death.slice(0, 10) : '',
      isDeceased: !!person?.date_of_death,
      gender: person?.gender || '',
    },
  });

  React.useEffect(() => {
    reset({
      firstName: person?.first_name || '',
      lastName: person?.last_name || '',
      birthDate: person?.date_of_birth ? person.date_of_birth.slice(0, 10) : '',
      deathDate: person?.date_of_death ? person.date_of_death.slice(0, 10) : '',
      isDeceased: !!person?.date_of_death,
      gender: person?.gender || '',
    });
  }, [person, reset]);

  const isDeceased = watch('isDeceased');

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 max-h-[340px] overflow-y-auto">
      <Input
        label="First Name"
        {...register('firstName', { required: 'First name is required' })}
        error={errors.firstName}
      />
      <Input
        label="Last Name"
        {...register('lastName', { required: 'Last name is required' })}
        error={errors.lastName}
      />
      <Input
        label="Birth Date"
        type="date"
        max={new Date().toISOString().split('T')[0]}
        {...register('birthDate', {
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Birth date cannot be in the future';
            return true;
          }
        })}
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
        type="date"
        max={new Date().toISOString().split('T')[0]}
        {...register('deathDate', {
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Death date cannot be in the future';
            return true;
          }
        })}
        error={errors.deathDate}
        disabled={!isDeceased}
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
      <div className="flex justify-end gap-4 mt-4">
        <Button type="button" onClick={onCancel} variant="grey">
          Cancel
        </Button>
        <Button type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};

export default EditPersonForm;
