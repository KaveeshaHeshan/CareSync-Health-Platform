import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'border-l-4 shadow-lg';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-white border-green-500`;
      case 'error':
        return `${baseStyles} bg-white border-red-500`;
      case 'warning':
        return `${baseStyles} bg-white border-yellow-500`;
      case 'info':
      default:
        return `${baseStyles} bg-white border-blue-500`;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right':
      default:
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
    }
  };

  const animationClass = isLeaving 
    ? 'animate-slide-out-right opacity-0' 
    : 'animate-slide-in-right';

  return (
    <div
      className={`fixed ${getPositionStyles()} z-50 max-w-md w-full transition-all duration-300 ${animationClass}`}
      role="alert"
    >
      <div className={`${getStyles()} rounded-lg p-4 flex items-start space-x-3`}>
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Toast Manager Component
export const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <NotificationToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000, position = 'top-right') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, position };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message, duration, position) => {
    return addToast(message, 'success', duration, position);
  };

  const showError = (message, duration, position) => {
    return addToast(message, 'error', duration, position);
  };

  const showWarning = (message, duration, position) => {
    return addToast(message, 'warning', duration, position);
  };

  const showInfo = (message, duration, position) => {
    return addToast(message, 'info', duration, position);
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
};

export default NotificationToast;
