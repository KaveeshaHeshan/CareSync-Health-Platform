import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

const FormCheckbox = forwardRef(({
  label,
  description,
  error,
  className = '',
  containerClassName = '',
  disabled = false,
  ...props
}, ref) => {
  const baseCheckboxStyles = 'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50';
  
  const errorStyles = error 
    ? 'border-red-300 text-red-600 focus:ring-red-500' 
    : '';

  const checkboxClassName = `${baseCheckboxStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClassName}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={checkboxClassName}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : description ? `${props.id}-description` : undefined}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label className="font-medium text-gray-700 cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500" id={`${props.id}-description`}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 ml-7 text-sm text-red-600" id={`${props.id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

FormCheckbox.displayName = 'FormCheckbox';

// Checkbox Group Component
export const CheckboxGroup = ({ 
  label, 
  error, 
  helperText,
  children, 
  className = '',
  required = false 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// Custom Styled Checkbox (larger, with custom colors)
export const StyledCheckbox = forwardRef(({
  label,
  description,
  error,
  checked,
  onChange,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className={className}>
      <label className="flex items-start cursor-pointer group">
        <div className="relative flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className={`
            w-5 h-5 border-2 rounded transition-all duration-200
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:border-indigo-400'}
            peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2
          `}>
            {checked && (
              <Check className="h-full w-full text-white p-0.5" strokeWidth={3} />
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <span className={`font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}>
                {label}
              </span>
            )}
            {description && (
              <p className="text-gray-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </label>
      {error && (
        <p className="mt-1 ml-8 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

StyledCheckbox.displayName = 'StyledCheckbox';

export default FormCheckbox;
