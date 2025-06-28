// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser]   = useState(null)
  const navigate          = useNavigate()

  // whenever token changes, set axios header & optionally fetch user
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // If you have an endpoint to fetch current user:
      api.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => logout())
    } else {
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    }
  }, [token])

  function login(email, password) {
    return api.post('/auth/sign_in', { user: { email, password } })
      .then(res => {
        const jwt = res.data.token
        localStorage.setItem('token', jwt)
        setToken(jwt)
        setUser(res.data.user) // Set user from login response
        navigate('/')        // redirect to home
        return res.data.user
      })
  }

  function register(name, email, password, password_confirmation) {
    return api.post('/auth', { user: { name, email, password, password_confirmation } })
      .then(res => {
        const jwt = res.data.token
        localStorage.setItem('token', jwt)
        setToken(jwt)
        setUser(res.data.user) // Set user from register response
        navigate('/')
        return res.data.user
      })
  }

  function logout() {
    api.delete('/auth/sign_out').finally(() => {
      localStorage.removeItem('token')
      setToken(null)
      navigate('/login')
    })
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
