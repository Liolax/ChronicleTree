import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/Layout/PageHeader';

export default function ResetPassword() {
  const { register, handleSubmit, watch } = useForm();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Extract token from URL query params
  const token = new URLSearchParams(location.search).get('reset_password_token');

  const onSubmit = async ({ password, password_confirmation }) => {
    setError(null);
    setStatus(null);
    try {
      const res = await resetPassword(token, password, password_confirmation);
      setStatus(res.message || 'Your password has been reset successfully.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(
        err?.response?.data?.errors?.full_messages?.join('\n') ||
        err?.response?.data?.error ||
        'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <>
      <PageHeader title="Reset Password" subtitle="Choose a new password" />
      <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
        {status && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded">{status}</div>
        )}
        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register('password', { required: true })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="relative">
              <input
                id="password_confirmation"
                type={showConfirm ? "text" : "password"}
                {...register('password_confirmation', { required: true })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset Password
          </button>
        </form>
      </div>
    </>
  );
}
