import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';

const EditPersonForm = ({ person, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: person,
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
      />
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
