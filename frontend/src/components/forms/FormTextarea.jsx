import React, { forwardRef } from 'react';

const FormTextarea = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  resize = 'vertical',
  ...props
}, ref) => {
  const [charCount, setCharCount] = React.useState(props.value?.length || 0);

  const baseTextareaStyles = 'block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm';
  
  const errorStyles = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';

  const resizeStyles = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const textareaClassName = `${baseTextareaStyles} ${errorStyles} ${resizeStyles[resize]} ${className}`.trim().replace(/\s+/g, ' ');

  const handleChange = (e) => {
    if (showCharCount || maxLength) {
      setCharCount(e.target.value.length);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {(showCharCount || maxLength) && (
          <span className={`text-xs ${maxLength && charCount > maxLength ? 'text-red-600' : 'text-gray-500'}`}>
            {charCount}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>
      
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className={textareaClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
        onChange={handleChange}
      />

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

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
