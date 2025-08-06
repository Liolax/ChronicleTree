import Swal from 'sweetalert2';

// Global aria-hidden prevention for accessibility
let globalAriaObserver = null;
let preventionInterval = null;

const preventAriaHiddenOnRoot = () => {
  const root = document.getElementById('root');
  if (!root) return;
  
  // Remove any existing aria-hidden immediately
  if (root.hasAttribute('aria-hidden')) {
    root.removeAttribute('aria-hidden');
  }
  
  // Create observer if it doesn't exist
  if (!globalAriaObserver) {
    globalAriaObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          if (root.hasAttribute('aria-hidden')) {
            root.removeAttribute('aria-hidden');
            console.log('Prevented aria-hidden on root element');
          }
        }
      });
    });
    
    // Start observing
    globalAriaObserver.observe(root, { 
      attributes: true, 
      attributeFilter: ['aria-hidden']
    });
  }
  
  // Also set up an interval check as backup
  if (!preventionInterval) {
    preventionInterval = setInterval(() => {
      if (root.hasAttribute('aria-hidden')) {
        root.removeAttribute('aria-hidden');
      }
    }, 50); // Check every 50ms
  }
};

// Initialize the global observer when this module loads
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure DOM is ready
  setTimeout(preventAriaHiddenOnRoot, 0);
  
  // Override SweetAlert2's default behavior to prevent aria-hidden
  if (typeof Swal !== 'undefined') {
    const originalFire = Swal.fire;
    Swal.fire = function(...args) {
      // Ensure aria-hidden prevention is active
      preventAriaHiddenOnRoot();
      
      // Also override the config to prevent aria-hidden
      if (args[0] && typeof args[0] === 'object') {
        args[0].didOpen = function() {
          // Remove aria-hidden immediately when modal opens
          const root = document.getElementById('root');
          if (root && root.hasAttribute('aria-hidden')) {
            root.removeAttribute('aria-hidden');
          }
          // Call original didOpen if it exists
          if (args[0].originalDidOpen) {
            args[0].originalDidOpen.apply(this, arguments);
          }
        };
        
        // Store original didOpen
        if (args[0].didOpen && args[0].didOpen !== arguments[0].didOpen) {
          args[0].originalDidOpen = args[0].didOpen;
        }
      }
      
      return originalFire.apply(this, args);
    };
  }
}

// Modal management functions
const hideAllOtherModals = () => {
  // Hide any open modals/dialogs except SweetAlert
  const modals = document.querySelectorAll('.modal, .dialog, [role="dialog"], .overlay, .popup');
  const hiddenModals = [];
  
  modals.forEach(modal => {
    // Don't hide SweetAlert modals
    if (!modal.classList.contains('swal2-container') && !modal.closest('.swal2-container')) {
      if (modal.style.display !== 'none' && !modal.hidden) {
        modal.dataset.wasVisible = 'true';
        modal.style.display = 'none';
        hiddenModals.push(modal);
      }
    }
  });
  
  return hiddenModals;
};

const restoreHiddenModals = () => {
  // Restore previously hidden modals
  const modals = document.querySelectorAll('[data-was-visible="true"]');
  modals.forEach(modal => {
    modal.style.display = '';
    modal.removeAttribute('data-was-visible');
  });
};

// Enhanced SweetAlert configuration for consistent styling
const getFullSweetAlertConfig = (icon) => {
  return {
    icon,
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
      confirmButton: 'swal-ok-btn'
    },
    buttonsStyling: false,
    didRender: () => {
      // Prevent SweetAlert from setting aria-hidden on root
      const root = document.getElementById('root');
      if (root && root.hasAttribute('aria-hidden')) {
        root.removeAttribute('aria-hidden');
      }
    },
    didOpen: () => {
      // Hide other modals for clear UI
      hideAllOtherModals();
      
      // Apply consistent styling
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
      }
      
      // Set z-index via JavaScript and remove aria-hidden
      const container = document.querySelector('.swal2-container');
      if (container) {
        container.style.zIndex = '2147483647';
      }
      
      const root = document.getElementById('root');
      if (root && root.hasAttribute('aria-hidden')) {
        root.removeAttribute('aria-hidden');
      }
    },
    didClose: () => {
      // Restore hidden modals when SweetAlert closes
      restoreHiddenModals();
      
      const root = document.getElementById('root');
      if (root && root.hasAttribute('aria-hidden')) {
        root.removeAttribute('aria-hidden');
      }
    }
  };
};
export const showError = (title, text) => {
  const config = getFullSweetAlertConfig('error');
  return Swal.fire({
    title,
    text,
    ...config
  });
};

export const showSuccess = (title, text) => {
  const config = getFullSweetAlertConfig('success');
  return Swal.fire({
    title,
    text,
    ...config
  });
};

export const showWarning = (title, text) => {
  const config = getFullSweetAlertConfig('warning');
  return Swal.fire({
    title,
    text,
    ...config
  });
};

export const showInfo = (title, text) => {
  const config = getFullSweetAlertConfig('info');
  return Swal.fire({
    title,
    text,
    ...config
  });
};

export const showConfirm = (title, text, confirmText = 'Yes', cancelText = 'No') => {
  const config = getFullSweetAlertConfig('question');
  return Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#4F46E5',
    cancelButtonColor: '#6B7280',
    customClass: {
      ...config.customClass,
      cancelButton: 'swal-cancel-btn',
    },
    ...config
  });
};

export const showDeleteConfirm = (title, text) => {
  const config = getFullSweetAlertConfig('warning');
  return Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    customClass: {
      ...config.customClass,
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
    },
    ...config
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
    title: message,
    customClass: {
      container: 'swal-high-z-index',
      popup: 'swal-popup-custom'
    },
    didOpen: () => {
      // Set z-index for toast
      const container = document.querySelector('.swal2-container');
      if (container) {
        container.style.zIndex = '2147483647';
      }
    }
  });
};