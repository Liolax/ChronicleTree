import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { register: registerInput, handleSubmit } = useForm()
  const { login } = useAuth()

  const onSubmit = ({ email, password }) => {
    login(email, password)
      .catch(() => alert('Login failed — check your credentials.'))
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Log In</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm">Email</label>
          <input
            id="email"
            type="email"
            {...registerInput('email', { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm">Password</label>
          <input
            id="password"
            type="password"
            {...registerInput('password', { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-button-primary hover:bg-button-primary-hover text-white py-2 rounded"
        >
          Log In
        </button>
      </form>
    </div>
  )
}
