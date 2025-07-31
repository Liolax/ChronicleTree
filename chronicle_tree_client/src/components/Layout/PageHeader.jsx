// Flexible page header component with fixed positioning and compact mode options
import React from 'react';

// Default header height for fixed positioning
export const PAGE_HEADER_HEIGHT = 72; // px

export default function PageHeader({ title, subtitle, fixed = false, compact = false, noMargin = false }) {
  // Implements card-style layout for compact display mode
  if (compact) {
    return (
      <div className="w-full flex justify-center mt-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 max-w-xl w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    );
  }

  // Generate CSS classes for header positioning
  const headerClass = fixed
    ? `bg-white shadow-sm${noMargin ? '' : ' mb-6'} fixed top-0 left-0 w-full z-30`
    : `bg-white shadow-sm${noMargin ? '' : ' mb-6'}`;
  // Adjust padding for different screen sizes
  const innerClass = noMargin
    ? 'w-full py-2 px-8 sm:px-16 lg:px-32'
    : 'max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8';

  return (
    <div
      className={headerClass}
      style={fixed ? { height: PAGE_HEADER_HEIGHT, minHeight: PAGE_HEADER_HEIGHT } : {}}
    >
      <div className={innerClass} style={fixed ? { minHeight: PAGE_HEADER_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' } : {}}>
        <h1 className="text-3xl font-bold leading-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
