import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/Layout/PageHeader';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { register, handleSubmit } = useForm();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async ({ email }) => {
    setStatus(null);
    setError(null);
    try {
      const res = await forgotPassword(email);
      setStatus(res.message || "If your email is registered, you'll receive instructions shortly.");
    } catch (err) {
      setError(
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.error ||
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <>
      <PageHeader title="Forgot Password" subtitle="Reset your password" />
      <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
        {status && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded">{status}</div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: true })}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Send Reset Instructions
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}