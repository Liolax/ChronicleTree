// Reusable card component with header, content, and footer sections for consistent UI layout
import React from 'react';

export default function Card({ children, title, subtitle, footer }) {
  return (
    <section className="bg-white shadow-md rounded-lg overflow-hidden" role="region" aria-label={title || undefined}>
      {(title || subtitle) && (
        <header className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </header>
      )}
      <div className="p-6">{children}</div>
      {footer && <footer className="px-6 py-4 bg-gray-50 text-right">{footer}</footer>}
    </section>
  );
}
