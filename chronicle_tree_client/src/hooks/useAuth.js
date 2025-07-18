// src/hooks/useAuth.js
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.js'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
