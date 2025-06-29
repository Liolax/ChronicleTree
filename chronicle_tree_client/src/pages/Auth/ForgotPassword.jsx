import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const { register, handleSubmit } = useForm()
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  const onSubmit = async ({ email }) => {
    setStatus(null)
    setError(null)
    try {
      const res = await forgotPassword(email)
      setStatus(res.message || "If your email is registered, you'll receive instructions shortly.")
    } catch (err) {
      setError(
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.error ||
        "Something went wrong. Please try again."
      )
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Forgot Password</h2>
      {status && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded">{status}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm">Email Address</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-button-primary hover:bg-button-primary-hover text-white py-2 rounded">
          Send Reset Instructions
        </button>
      </form>
    </div>
  )
}