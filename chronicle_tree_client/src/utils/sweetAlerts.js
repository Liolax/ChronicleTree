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
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-lg shadow-xl',
      title: 'text-xl font-bold text-gray-900',
      htmlContainer: 'text-sm',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 border-transparent focus:ring-red-500 px-4 py-2',
      cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-400 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 px-4 py-2 mr-2'
    },
    buttonsStyling: false
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