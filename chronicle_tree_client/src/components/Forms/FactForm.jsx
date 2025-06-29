import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';

const FactForm = ({ fact, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: fact || {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title"
        name="title"
        register={register}
        rules={{ required: 'Title is required' }}
        error={errors.title}
      />
      <Input
        label="Date"
        name="date"
        type="date"
        register={register}
        rules={{ required: 'Date is required' }}
        error={errors.date}
      />
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          {...register('description')}
          rows={3}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
        />
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

export default FactForm;
