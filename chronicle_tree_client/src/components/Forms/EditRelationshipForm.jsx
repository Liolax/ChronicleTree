import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';

const EditRelationshipForm = ({ relationship, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: relationship,
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Relationship Type"
        {...register('relationshipType', { required: 'Relationship type is required' })}
        error={errors.relationshipType}
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

export default EditRelationshipForm;
