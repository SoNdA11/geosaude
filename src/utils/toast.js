let toastCallback = null;

export const setToastCallback = (callback) => {
  toastCallback = callback;
};

export const toast = {
  success: (message, duration = 3000) => {
    if (toastCallback) {
      toastCallback({ type: 'success', message, duration });
    } else {
      console.log('Success Toast (fallback):', message);
    }
  },
  error: (message, duration = 4000) => {
    if (toastCallback) {
      toastCallback({ type: 'error', message, duration });
    } else {
      console.error('Error Toast (fallback):', message);
    }
  },
  warning: (message, duration = 3500) => {
    if (toastCallback) {
      toastCallback({ type: 'warning', message, duration });
    } else {
      console.warn('Warning Toast (fallback):', message);
    }
  },
  info: (message, duration = 3000) => {
    if (toastCallback) {
      toastCallback({ type: 'info', message, duration });
    } else {
      console.info('Info Toast (fallback):', message);
    }
  }
};
