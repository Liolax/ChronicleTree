import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavBar from './components/Layout/NavBar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import TreeView from './pages/TreeView';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import FamilyTreeDemo from './pages/FamilyTreeDemo';
import PrivateRoute from './components/Auth/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              {/* Demo route without navbar */}
              <Route path="/demo" element={<FamilyTreeDemo />} />
              
              {/* Other routes with navbar */}
              <Route path="/*" element={
                <>
                  <NavBar />
                  <main className="container mx-auto py-6">
                    <Routes>
                      {/* public */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* private */}
                      <Route path="/" element={<PrivateRoute><TreeView /></PrivateRoute>} />
                      <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

                      {/* Redirect non-matching routes to home */}
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </>
              } />
            </Routes>
            {/* A Footer component would go here */}
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
