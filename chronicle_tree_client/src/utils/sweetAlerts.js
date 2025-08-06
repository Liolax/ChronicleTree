import Swal from 'sweetalert2';

// SweetAlert2 utility functions for consistent styling across the app
export const showError = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    iconColor: '#dc2626',
    confirmButtonText: 'OK',
    confirmButtonColor: '#4F46E5',
    allowOutsideClick: false,
    allowEscapeKey: true,
    backdrop: 'rgba(0, 0, 0, 0.6)',
    position: 'center',
    customClass: {
      container: 'swal-container-custom',
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-ok-btn',
      icon: 'swal-icon-custom'
    },
    buttonsStyling: false,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.fontFamily = 'Inter, sans-serif';
        popup.style.background = '#FEFEFA';
        popup.style.borderRadius = '1.5rem';
        popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
        popup.style.border = '2px solid #A0C49D';
        popup.style.padding = '2rem';
        popup.style.minWidth = '320px';
        popup.style.maxWidth = '400px';
        popup.style.width = '100%';
        
        // Remove aria-hidden from root to fix accessibility issue
        const root = document.getElementById('root');
        if (root) {
          root.removeAttribute('aria-hidden');
        }
      }
    },
    didClose: () => {
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('aria-hidden');
      }
    }
  });
};

export const showSuccess = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    iconColor: '#10b981',
    confirmButtonText: 'OK',
    confirmButtonColor: '#4F46E5',
    allowOutsideClick: false,
    allowEscapeKey: true,
    backdrop: 'rgba(0, 0, 0, 0.6)',
    position: 'center',
    customClass: {
      container: 'swal-container-custom',
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-ok-btn',
      icon: 'swal-icon-custom'
    },
    buttonsStyling: false,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.fontFamily = 'Inter, sans-serif';
        popup.style.background = '#FEFEFA';
        popup.style.borderRadius = '1.5rem';
        popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
        popup.style.border = '2px solid #A0C49D';
        popup.style.padding = '2rem';
        popup.style.minWidth = '320px';
        popup.style.maxWidth = '400px';
        popup.style.width = '100%';
        
        // Remove aria-hidden from root to fix accessibility issue
        const root = document.getElementById('root');
        if (root) {
          root.removeAttribute('aria-hidden');
        }
      }
    },
    didClose: () => {
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('aria-hidden');
      }
    }
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
    iconColor: '#f59e0b',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    backdrop: 'rgba(0, 0, 0, 0.6)',
    position: 'center',
    customClass: {
      container: 'swal-container-custom',
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      htmlContainer: 'swal-content-custom',
      actions: 'swal-actions-custom',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
      icon: 'swal-icon-custom'
    },
    buttonsStyling: false,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.fontFamily = 'Inter, sans-serif';
        popup.style.background = '#FEFEFA';
        popup.style.borderRadius = '1.5rem';
        popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
        popup.style.border = '2px solid #A0C49D';
        popup.style.padding = '2rem';
        popup.style.minWidth = '320px';
        popup.style.maxWidth = '400px';
        popup.style.width = '100%';
        
        // Remove aria-hidden from root to fix accessibility issue
        const root = document.getElementById('root');
        if (root) {
          root.removeAttribute('aria-hidden');
        }
      }
    },
    didClose: () => {
      // Clean up any aria-hidden attributes when modal closes
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('aria-hidden');
      }
    }
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