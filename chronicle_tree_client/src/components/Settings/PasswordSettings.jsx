import React from 'react';
import { useForm } from 'react-hook-form';
import { useChangePassword } from '../../services/users';
import Card from '../UI/Card';
import Input from '../UI/Input';
import Button from '../UI/Button';

export default function PasswordSettings() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const changePassword = useChangePassword();

  const onSubmit = (data) => {
    changePassword.mutate({
      current_password: data.currentPassword,
      password: data.newPassword,
      password_confirmation: data.confirmNewPassword,
    });
  };

  return (
    <Card
      title="Change Password"
      footer={
        <Button
          type="submit"
          form="password-form"
          disabled={changePassword.isPending}
        >
          {changePassword.isPending ? 'Updating...' : 'Update Password'}
        </Button>
      }
    >
      <form id="password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="currentPassword"
          label="Current Password"
          type="password"
          {...register('currentPassword', { required: true })}
        />
        <Input
          id="newPassword"
          label="New Password"
          type="password"
          {...register('newPassword', { required: true, minLength: 8 })}
        />
        {errors.newPassword && <p className="text-red-500 text-xs italic">Password must be at least 8 characters.</p>}
        <Input
          id="confirmNewPassword"
          label="Confirm New Password"
          type="password"
          {...register('confirmNewPassword', { required: true })}
        />
      </form>
    </Card>
  );
}
