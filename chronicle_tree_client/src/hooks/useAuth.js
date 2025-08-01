// Custom hook for accessing authentication context and user session state
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.js'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
