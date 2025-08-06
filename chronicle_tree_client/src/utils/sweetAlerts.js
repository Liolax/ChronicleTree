import Swal from 'sweetalert2';

// Simple aria-hidden prevention
const preventAriaHidden = () => {
  const root = document.getElementById('root');
  if (root && root.hasAttribute('aria-hidden')) {
    root.removeAttribute('aria-hidden');
  }
};

// SweetAlert2 utility functions for consistent styling across the app
export const showError = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: true,
    customClass: {
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-ok-btn'
    },
    buttonsStyling: false,
    didOpen: preventAriaHidden,
    didClose: preventAriaHidden
  });
};

export const showSuccess = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: true,
    customClass: {
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-ok-btn'
    },
    buttonsStyling: false,
    didOpen: preventAriaHidden,
    didClose: preventAriaHidden
  });
};

export const showWarning = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    customClass: {
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-ok-btn'
    },
    buttonsStyling: false,
    didOpen: preventAriaHidden,
    didClose: preventAriaHidden
  });
};

// Allow custom popup class for special cases (e.g., flexible size)
export const showInfo = (title, text, customPopupClass = null) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'OK',
    customClass: {
      popup: customPopupClass || 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-ok-btn'
    },
    buttonsStyling: false,
    didOpen: preventAriaHidden,
    didClose: preventAriaHidden
  });
};

export const showConfirm = (title, text, confirmText = 'Yes', cancelText = 'No') => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-ok-btn',
      cancelButton: 'swal-cancel-btn'
    },
    buttonsStyling: false,
    didOpen: preventAriaHidden,
    didClose: preventAriaHidden
  });
};

export const showDeleteConfirm = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    customClass: {
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn'
    },
    buttonsStyling: false,
    didOpen: preventAriaHidden,
    didClose: preventAriaHidden
  });
};

// Toast notifications for quick feedback
export const showToast = (message, icon = 'success', timer = 3000) => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    icon,
    title: message
  });
};