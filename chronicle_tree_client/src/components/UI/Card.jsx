import React from 'react';

export default function Card({ children, title, footer }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-4 bg-gray-50 text-right">{footer}</div>}
    </div>
  );
}
