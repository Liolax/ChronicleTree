import React from 'react';

export default function Modal({ isOpen, onClose, title, titleIcon, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">{titleIcon}{title}</h3>
          <button className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
