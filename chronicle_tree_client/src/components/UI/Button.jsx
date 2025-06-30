import React from 'react';

export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false }) {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent focus:ring-indigo-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
    grey: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-400 focus:ring-gray-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}
