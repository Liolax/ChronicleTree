import React from 'react';
import { FaUser, FaHeart, FaUsers } from 'react-icons/fa';
import { HiOutlineUserCircle } from 'react-icons/hi';

const ProfileLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      {/* Main profile loading animation */}
      <div className="relative mb-8">
        {/* Pulsing profile icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-purple-500 rounded-full p-6">
            <HiOutlineUserCircle className="w-16 h-16 text-white" />
          </div>
        </div>
        
        {/* Floating profile icons */}
        <div className="absolute -top-3 -left-10 animate-bounce" style={{ animationDelay: '0.2s' }}>
          <div className="bg-blue-400 rounded-full p-2">
            <FaUser className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="absolute -top-3 -right-10 animate-bounce" style={{ animationDelay: '0.4s' }}>
          <div className="bg-pink-400 rounded-full p-2">
            <FaHeart className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.6s' }}>
          <div className="bg-green-400 rounded-full p-2">
            <FaUsers className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Loading Profile
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="text-gray-500">Gathering personal details</div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-6 w-48 bg-gray-200 rounded-full h-2">
        <div className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full animate-pulse" 
             style={{ width: '75%', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      </div>
      
      <div className="mt-3 text-sm text-gray-400">
        Loading biographical information...
      </div>
    </div>
  );
};

export default ProfileLoader;