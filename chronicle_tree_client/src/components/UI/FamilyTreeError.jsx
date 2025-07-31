import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { HiOutlineUsers } from 'react-icons/hi';

const FamilyTreeError = ({ onRetry = null }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-red-50 to-orange-50">
      {/* Error icon with animation */}
      <div className="relative mb-6">
        <div className="bg-red-100 rounded-full p-6">
          <div className="relative">
            <HiOutlineUsers className="w-12 h-12 text-gray-400" />
            <div className="absolute -top-1 -right-1">
              <FaExclamationTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Unable to Load Family Tree
        </h3>
        <p className="text-gray-500 max-w-md">
          We're having trouble connecting to your family data. Please check your connection and try again.
        </p>
      </div>
      
      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          <FaRedo className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
      
      {!onRetry && (
        <div className="text-sm text-gray-400">
          Please refresh the page to try again
        </div>
      )}
    </div>
  );
};

export default FamilyTreeError;