// Accessible modal component with focus trapping and keyboard navigation support
import React, { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, titleIcon, children }) {
  const modalRef = useRef(null);
  const lastActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement;
      // Implements accessibility guidelines for modal focus management
      modalRef.current?.focus();
      // Focus trapping algorithm prevents keyboard navigation outside modal
      const handleTab = (e) => {
        const focusableEls = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleTab);
      return () => {
        document.removeEventListener('keydown', handleTab);
        // Restores focus to element that opened modal for accessibility
        lastActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        ref={modalRef}
        style={{ fontFamily: 'Inter, sans-serif', background: '#FEFEFA', borderRadius: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '2px solid #A0C49D', padding: '2rem', minWidth: 320, maxWidth: 400, width: '100%' }}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3 w-full">
          <h3 id="modal-title" className="text-xl font-semibold text-app-primary flex items-center">{titleIcon}{title}</h3>
          <button className="text-app-secondary hover:text-app-primary text-2xl" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
