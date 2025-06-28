import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  useCurrentUser,
  useUpdateUser,
  useChangePassword,
  useDeleteAccount
} from '../services/users'

export default function Settings() {
  // fetch current user
  const { data: user, isLoading: loadingUser } = useCurrentUser()

  // forms
  const { register, handleSubmit, reset } = useForm()
  const { register: pwRegister, handleSubmit: handlePw } = useForm()

  // mutations
  const updateUser    = useUpdateUser()
  const changePassword = useChangePassword()
  const deleteAccount = useDeleteAccount()

// reset profile form when user changes
useEffect(() => {
  if (user) {
    reset({ name: user.name, email: user.email })
  }
}, [user, reset])

if (loadingUser) return <p>Loading…</p>
if (!user)      return <p>Error loading user.</p>

// init form with fetched data
const onSubmitProfile = data => {
  updateUser.mutate(data)
}

const onSubmitPassword = data => {
  changePassword.mutate({
    current_password:      data.currentPassword,
    password:              data.newPassword,
    password_confirmation: data.confirmNewPassword
  })
}

  return (
    <div className="max-w-md mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Profile edit */}
      <form onSubmit={handleSubmit(onSubmitProfile)} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">User Profile</h2>
        <label className="block">
          Name
          <input {...register('name')} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          Email
          <input type="email" {...register('email')} className="w-full p-2 border rounded" />
        </label>
        <button
          type="submit"
          className="bg-button-primary text-white py-2 px-4 rounded"
          disabled={updateUser.isLoading}
        >
          {updateUser.isLoading ? 'Saving…' : 'Save Changes'}
        </button>
        {updateUser.isError && <p className="text-red-600">{updateUser.error.message}</p>}
      </form>

      {/* Change password */}
      <form onSubmit={handlePw(onSubmitPassword)} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <label className="block">
          Current Password
          <input type="password" {...pwRegister('currentPassword', { required: true })} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          New Password
          <input type="password" {...pwRegister('newPassword', { required: true, minLength: 8 })} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          Confirm New Password
          <input type="password" {...pwRegister('confirmNewPassword', { required: true })} className="w-full p-2 border rounded" />
        </label>
        <button
          type="submit"
          className="bg-button-primary text-white py-2 px-4 rounded"
          disabled={changePassword.isLoading}
        >
          {changePassword.isLoading ? 'Updating…' : 'Update Password'}
        </button>
        {changePassword.isError && <p className="text-red-600">{changePassword.error.message}</p>}
      </form>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-300 p-6 rounded space-y-4">
        <h2 className="text-xl font-semibold text-red-800">Danger Zone</h2>
        <p className="text-red-700">This will permanently delete your account.</p>
        <button
          onClick={() => {
            if (confirm('Type DELETE to confirm:') && prompt() === 'DELETE') {
              deleteAccount.mutate()
            }
          }}
          className="bg-button-danger text-white py-2 px-4 rounded"
        >
          Delete My Account
        </button>
      </div>
    </div>
  )
}
