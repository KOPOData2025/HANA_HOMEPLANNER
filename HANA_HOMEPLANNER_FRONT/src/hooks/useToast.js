import { useState, useCallback } from 'react';

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const toastId = Date.now();
    const newToast = {
      id: toastId,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date()
    };

    setToasts(prev => [...prev, newToast]);

    // 3초 후 자동으로 제거
    setTimeout(() => {
      removeToast(toastId);
    }, 3000);

    return toastId;
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts
  };
};

export default useToast;
