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
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => logout())
    } else {
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    }
    // eslint-disable-next-line
  }, [token])

  // async/await implementation for login
  async function login(email, password) {
    const res = await api.post('/auth/sign_in', { user: { email, password } });
    const jwt = res.headers.authorization.split(' ')[1]
    localStorage.setItem('token', jwt)
    setToken(jwt)
    setUser(res.data.data)
    navigate('/')
    return res.data.data
  }

  // async/await implementation for register
  async function register(name, email, password, password_confirmation) {
    const res = await api.post('/auth', { user: { name, email, password, password_confirmation } });
    const jwt = res.headers.authorization.split(' ')[1]
    localStorage.setItem('token', jwt)
    setToken(jwt)
    setUser(res.data.data)
    navigate('/')
    return res.data.data
  }

  // async/await implementation for forgot password
  // Returns { message } or throws error
  async function forgotPassword(email) {
    // Devise expects the user object for API format
    const res = await api.post('/auth/password', { user: { email } });
    // Devise returns { message: "You will receive an email with instructions..." }
    return res.data
  }

  function logout() {
    api.delete('/auth/sign_out').finally(() => {
      localStorage.removeItem('token')
      setToken(null)
      navigate('/login')
    })
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}