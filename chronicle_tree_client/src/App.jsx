import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavBar from './components/Layout/NavBar'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import TreeView from './pages/TreeView'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import PrivateRoute from './components/Auth/PrivateRoute'
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
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

              {/* Redirect non-matching routes to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          {/* A Footer component would go here */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
