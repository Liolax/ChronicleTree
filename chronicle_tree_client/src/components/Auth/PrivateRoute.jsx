// Route protection component that enforces authentication before accessing protected pages
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}
