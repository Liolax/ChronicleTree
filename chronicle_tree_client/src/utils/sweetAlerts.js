import Swal from 'sweetalert2';

// SweetAlert2 utility functions for consistent styling across the app
export const showError = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#4F46E5'
  });
};

export const showSuccess = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#4F46E5'
  });
};

export const showWarning = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#4F46E5'
  });
};

export const showInfo = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#4F46E5'
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
    confirmButtonColor: '#4F46E5',
    cancelButtonColor: '#6B7280'
  });
};

export const showDeleteConfirm = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626', // Red for delete
    cancelButtonColor: '#6B7280', // Gray for cancel
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
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