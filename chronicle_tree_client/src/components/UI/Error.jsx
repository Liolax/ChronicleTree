import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

// Utility to combine classes
const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

const Error = ({ title, message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 w-full bg-red-50/50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
        <FaExclamationTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-red-800">{title}</h3>
        <p className="mt-1 text-sm text-red-600 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-500/90 h-10 px-4 py-2 transition-colors"
          onClick={onRetry}
        >
          <FaRedo className="mr-2 h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;