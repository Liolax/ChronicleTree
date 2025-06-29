import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded transition-colors duration-150 hover:text-app-primary hover:bg-app-accent/20 ${isActive ? 'font-bold text-app-primary bg-app-accent/30' : 'text-app-secondary'}`;

  return (
    <header className="bg-app-container shadow-md flex items-center justify-between px-6 py-4 sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-app-primary">
        ChronicleTree
      </Link>
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center space-x-6">
        {user ? (
          <>
            <NavLink to="/" className={navLinkClasses}>Tree</NavLink>
            <NavLink to="/profile/me" className={navLinkClasses}>Profile</NavLink>
            <NavLink to="/settings" className={navLinkClasses}>Settings</NavLink>
            <button
              onClick={logout}
              className="ml-4 px-4 py-2 bg-button-danger hover:bg-button-danger-hover text-white font-bold rounded transition-colors"
            >
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
      {/* Mobile Nav Toggle */}
      <button className="md:hidden text-app-primary focus:outline-none" onClick={() => setMobileOpen(!mobileOpen)}>
        <span className="sr-only">Open main menu</span>
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {/* Mobile Nav Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-app-container shadow-md md:hidden flex flex-col items-center py-4 z-50">
          {user ? (
            <>
              <NavLink to="/" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Tree</NavLink>
              <NavLink to="/profile/me" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Profile</NavLink>
              <NavLink to="/settings" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Settings</NavLink>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="mt-2 px-4 py-2 bg-button-danger hover:bg-button-danger-hover text-white font-bold rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Login</NavLink>
              <NavLink to="/register" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
