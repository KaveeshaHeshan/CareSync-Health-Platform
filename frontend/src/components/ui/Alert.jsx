import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({
  children,
  variant = 'info',
  title,
  closable = false,
  onClose,
  className = '',
  icon: CustomIcon,
  ...props
}) => {
  const baseStyles = 'rounded-lg border p-4';

  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    default: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  const getIcon = () => {
    if (CustomIcon) return CustomIcon;

    switch (variant) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return XCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const Icon = getIcon();
  const iconColor = getIconColor();

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={combinedClassName} role="alert" {...props}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>

        {closable && onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close alert"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Alert Title component
export const AlertTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-sm font-semibold mb-1 ${className}`}>
      {children}
    </h3>
  );
};

// Alert Description component
export const AlertDescription = ({ children, className = '' }) => {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
};

// Inline Alert - Compact version for forms
export const InlineAlert = ({ children, variant = 'error', icon: CustomIcon, className = '' }) => {
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    switch (variant) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return XCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const Icon = getIcon();
  const color = getColor();

  return (
    <div className={`flex items-center gap-2 text-sm ${color} ${className}`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export default Alert;
