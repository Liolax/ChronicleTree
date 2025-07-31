import React from 'react';
import { FaCog, FaUser, FaShield } from 'react-icons/fa';

const SettingsLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Main settings loading animation */}
      <div className="relative mb-8">
        {/* Spinning settings icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-gray-600 rounded-full p-6">
            <FaCog className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '2s' }} />
          </div>
        </div>
        
        {/* Floating settings icons */}
        <div className="absolute -top-2 -left-8 animate-bounce" style={{ animationDelay: '0.1s' }}>
          <div className="bg-blue-400 rounded-full p-2">
            <FaUser className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="absolute -top-2 -right-8 animate-bounce" style={{ animationDelay: '0.3s' }}>
          <div className="bg-green-400 rounded-full p-2">
            <FaShield className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Loading Settings
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="text-gray-500">Preparing your preferences</div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        Loading account information...
      </div>
    </div>
  );
};

export default SettingsLoader;