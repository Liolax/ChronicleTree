import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 hover:text-gray-800 ${isActive ? 'font-bold text-gray-800' : 'text-gray-600'}`;

  return (
    <header className="bg-app-container shadow-md flex items-center justify-between px-6 py-4 sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-app-primary">
        ChronicleTree
      </Link>
      <nav className="hidden md:flex items-center space-x-6">
        {user ? (
          <>
            <NavLink to="/" className={navLinkClasses}>Tree</NavLink>
            <NavLink to="/profile/me" className={navLinkClasses}>Profile</NavLink>
            <NavLink to="/settings" className={navLinkClasses}>Settings</NavLink>
            <button onClick={logout} className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
            <NavLink to="/register" className={navLinkClasses}>Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
