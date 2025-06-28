import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

export default function Register() {
  const { register: r, handleSubmit } = useForm()
  const { register: signup } = useAuth()
  const [formErrors, setFormErrors] = useState([])

  const onSubmit = ({ name, email, password, password_confirmation }) => {
    setFormErrors([])
    signup(name, email, password, password_confirmation)
      .catch(err => {
        const msgs = err.response?.data?.errors || ['Registration failed']
        setFormErrors(msgs)
      })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Register</h2>

      {formErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
          <ul className="list-disc list-inside">
            {formErrors.map((error, i) => <li key={i}>{error}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input {...r('name', { required: true })} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input type="email" {...r('email', { required: true })} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" {...r('password', { required: true })} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Confirm Password</label>
          <input type="password" {...r('password_confirmation', { required: true })} className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-button-primary hover:bg-button-primary-hover text-white py-2 rounded">
          Register
        </button>
      </form>
    </div>
  )
}
