import { useState, useCallback } from 'react';

const useErrorNotification = () => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((error) => {
    const errorId = Date.now();
    const newError = {
      id: errorId,
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      type: error.type || 'error',
      timestamp: new Date(),
      details: error.details || null
    };

    setErrors(prev => [...prev, newError]);

    // 5초 후 자동으로 제거
    setTimeout(() => {
      removeError(errorId);
    }, 5000);

    return errorId;
  }, []);

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  const showError = useCallback((message, type = 'error') => {
    console.error('Error:', message);
    addError({ message, type });
  }, [addError]);

  return {
    errors,
    addError,
    removeError,
    clearAllErrors,
    getLatestError,
    showError
  };
};

export default useErrorNotification;
