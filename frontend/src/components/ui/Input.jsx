import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  type = 'text', 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Left Icon (Optional) */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Icon size={18} />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={type}
          className={`
            w-full transition-all duration-200
            bg-white border-2 rounded-xl text-sm
            placeholder:text-slate-400 outline-none
            ${Icon ? 'pl-11 pr-4' : 'px-4'}
            py-2.5
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

// Setting a display name for easier debugging in React DevTools
Input.displayName = 'Input';

export default Input;