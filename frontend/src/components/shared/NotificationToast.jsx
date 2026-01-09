import React, { useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';

const NotificationToast = ({ 
  message, 
  description,
  type = 'success', // success, error, info, warning
  onClose, 
  duration = 5000 
}) => {
  
  // Auto-close logic
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Configuration for different toast types
  const toastConfig = {
    success: {
      icon: <CheckCircle className="text-emerald-500" size={20} />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      progress: 'bg-emerald-500'
    },
    error: {
      icon: <AlertCircle className="text-red-500" size={20} />,
      bg: 'bg-red-50',
      border: 'border-red-100',
      progress: 'bg-red-500'
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      progress: 'bg-amber-500'
    },
    info: {
      icon: <Info className="text-indigo-500" size={20} />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      progress: 'bg-indigo-500'
    }
  };

  const config = toastConfig[type];

  return (
    <div 
      role="alert"
      className={`
        fixed top-6 right-6 z-[100] w-full max-w-sm
        ${config.bg} border ${config.border} rounded-2xl shadow-xl
        animate-in slide-in-from-right-10 fade-in duration-300
      `}
    >
      <div className="p-4 flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800">
            {message}
          </h4>
          {description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar (Visual Timer) */}
      {duration && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5 rounded-b-2xl overflow-hidden">
          <div 
            className={`h-full ${config.progress} transition-all duration-[5000ms] linear`}
            style={{ width: '0%', animation: `progress ${duration}ms linear forwards` }}
          />
        </div>
      )}

      {/* Internal style for the progress animation */}
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;