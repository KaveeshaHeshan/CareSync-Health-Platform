import React from 'react';
import { ChevronDown } from 'lucide-react';

const FormSelect = ({ 
  label, 
  name, 
  options = [], 
  register, 
  errors, 
  icon: Icon, 
  placeholder = "Select an option",
  className = '',
  ...props 
}) => {
  
  // Helper to extract nested error messages (same logic as FormInput)
  const getErrorMessage = (name, errors) => {
    return name.split('.').reduce((obj, key) => obj?.[key], errors)?.message;
  };

  const error = getErrorMessage(name, errors);

  return (
    <div className="w-full space-y-1.5">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 pointer-events-none transition-colors">
            <Icon size={18} />
          </div>
        )}

        {/* Select Element */}
        <select
          {...register(name)}
          className={`
            w-full appearance-none transition-all duration-200
            bg-white border-2 rounded-xl text-sm
            outline-none cursor-pointer
            ${Icon ? 'pl-11 pr-10' : 'px-4 pr-10'}
            py-2.5
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
            }
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Chevron (Since we disabled default appearance) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;