import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text = '',
  className = '',
}) => {
  const sizeStyles = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorStyles = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
  };

  const spinnerElement = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 
        className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
      />
      {text && (
        <p className={`mt-2 text-sm ${colorStyles[color]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

// Centered spinner for loading states within containers
export const CenteredSpinner = ({ size = 'lg', text = 'Loading...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <Spinner size={size} text={text} />
    </div>
  );
};

// Inline spinner for buttons or inline elements
export const InlineSpinner = ({ size = 'sm', color = 'primary' }) => {
  return (
    <Loader2 className={`animate-spin ${size === 'xs' ? 'h-3 w-3' : 'h-4 w-4'} ${color === 'white' ? 'text-white' : 'text-indigo-600'}`} />
  );
};

export default Spinner;
