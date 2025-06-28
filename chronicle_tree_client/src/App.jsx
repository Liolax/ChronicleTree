import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/Layout/NavBar'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import TreeView from './pages/TreeView'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import PrivateRoute from './components/Auth/PrivateRoute'

function App() {
  return (
    <>
      <NavBar/>
      <main className="container mx-auto py-6">
        <Routes>
          {/* public */}
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>

          {/* private */}
          <Route path="/" element={<PrivateRoute><TreeView/></PrivateRoute>}/>
          <Route path="/profile/:id" element={<PrivateRoute><Profile/></PrivateRoute>}/>
          <Route path="/settings" element={<PrivateRoute><Settings/></PrivateRoute>}/>

          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </main>
    </>
  )
}

export default App
