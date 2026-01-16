import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  className = '',
  containerClassName = '',
  required = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = type === 'password' && showPasswordToggle 
    ? (showPassword ? 'text' : 'password')
    : type;

  const baseInputStyles = 'block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm';
  
  const errorStyles = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';

  const iconPaddingStyles = Icon && iconPosition === 'left' ? 'pl-10' : Icon && iconPosition === 'right' ? 'pr-10' : '';
  const passwordTogglePadding = type === 'password' && showPasswordToggle ? 'pr-10' : '';

  const inputClassName = `${baseInputStyles} ${errorStyles} ${iconPaddingStyles} ${passwordTogglePadding} ${className}`.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          required={required}
          className={inputClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
        )}

        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${props.id}-error`}>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500" id={`${props.id}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
