import React from 'react';
import { FaUserFriends, FaHeart } from 'react-icons/fa';
import { HiOutlineUsers } from 'react-icons/hi';

const FamilyTreeLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-green-50">
      {/* Main loading animation */}
      <div className="relative mb-8">
        {/* Pulsing family tree icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-green-500 rounded-full p-6">
            <HiOutlineUsers className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Floating family icons */}
        <div className="absolute -top-2 -left-8 animate-bounce" style={{ animationDelay: '0.1s' }}>
          <div className="bg-blue-400 rounded-full p-2">
            <FaUserFriends className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="absolute -top-2 -right-8 animate-bounce" style={{ animationDelay: '0.3s' }}>
          <div className="bg-pink-400 rounded-full p-2">
            <FaHeart className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <div className="bg-purple-400 rounded-full p-2">
            <FaUserFriends className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      
      {/* Loading text with typewriter effect */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Building Your Family Tree
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="text-gray-500">Connecting generations</div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-6 w-64 bg-gray-200 rounded-full h-2">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full animate-pulse" 
             style={{ width: '60%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      </div>
      
      <div className="mt-3 text-sm text-gray-400">
        Loading family relationships...
      </div>
    </div>
  );
};

export default FamilyTreeLoader;