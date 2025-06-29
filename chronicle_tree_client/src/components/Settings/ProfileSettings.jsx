import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateUser } from '../../services/users';
import Card from '../UI/Card';
import Input from '../UI/Input';
import Button from '../UI/Button';

export default function ProfileSettings({ user }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    updateUser.mutate(data);
  };

  return (
    <Card
      title="User Profile"
      footer={
        <Button
          type="submit"
          form="profile-form"
          disabled={updateUser.isPending}
        >
          {updateUser.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Name"
          {...register('name')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          {...register('email')}
        />
        {updateUser.isError && <p className="text-red-600">{updateUser.error.message}</p>}
      </form>
    </Card>
  );
}
