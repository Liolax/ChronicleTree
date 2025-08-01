// Responsive navigation bar with mobile menu and authentication state management
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded transition-colors duration-150 hover:text-app-primary hover:bg-app-accent/20 ${isActive ? 'font-bold text-app-primary bg-app-accent/30' : 'text-app-secondary'}`;

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
      <header className="bg-app-container shadow-md flex items-center justify-between px-6 py-4 sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-app-primary">
          ChronicleTree
        </Link>
        {/* Desktop navigation menu with conditional authentication links */}
        <nav className="hidden md:flex items-center space-x-2">
          {user ? (
            <>
              <NavLink to="/" className={navLinkClasses}>Tree</NavLink>
              <NavLink to="/settings" className={navLinkClasses}>Settings</NavLink>
              <button
                onClick={logout}
                className="px-4 py-2 rounded transition-colors duration-150 text-app-secondary hover:text-button-danger hover:bg-app-accent/20"
                title="Logout"
                aria-label="Logout"
                style={{ marginLeft: '0.5rem' }}
              >
                <i className="fas fa-sign-out-alt mr-1"></i>Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
              <NavLink to="/register" className={navLinkClasses}>Register</NavLink>
            </>
          )}
        </nav>
        {/* Mobile menu toggle button with hamburger icon */}
        <button 
          className={`md:hidden focus:outline-none px-2 py-1 rounded transition-colors ${
            mobileOpen 
              ? 'bg-button-primary text-white' 
              : 'text-app-primary hover:bg-app-accent/20'
          }`} 
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        {/* Collapsible mobile navigation menu */}
        {mobileOpen && (
          <>
            {/* Overlay behind navbar menu - positioned below header */}
            <div 
              className="fixed bg-black bg-opacity-50 z-40 md:hidden"
              style={{ top: '100%', left: 0, right: 0, bottom: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute top-full left-0 w-full bg-app-container shadow-lg border-t md:hidden flex flex-col items-center py-6 z-50 animate-fade-in" style={{ height: 'auto', maxHeight: '60vh' }}>
              {user ? (
                <>
                  <NavLink to="/" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Tree</NavLink>
                  <NavLink to="/settings" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Settings</NavLink>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="px-4 py-2 rounded transition-colors duration-150 text-app-secondary hover:text-button-danger hover:bg-app-accent/20 mt-4"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <i className="fas fa-sign-out-alt mr-1"></i>Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Login</NavLink>
                  <NavLink to="/register" className={navLinkClasses} onClick={() => setMobileOpen(false)}>Register</NavLink>
                </>
              )}
            </div>
          </>
        )}
      </header>
    </>
  );
}
