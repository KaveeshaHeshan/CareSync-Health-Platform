import React from 'react';
import Input from '../ui/Input';

/**
 * FormInput Component
 * A wrapper for the Input atom that integrates seamlessly with React Hook Form.
 * * @param {string} name - The unique name of the field (must match Zod schema)
 * @param {Object} register - The register function from useForm()
 * @param {Object} errors - The errors object from useFormState()
 */
const FormInput = ({ 
  label, 
  name, 
  register, 
  errors, 
  icon, 
  type = 'text', 
  placeholder,
  className = '',
  ...props 
}) => {
  // Deeply find the error message (handles nested objects like 'profile.firstName')
  const getErrorMessage = (name, errors) => {
    return name.split('.').reduce((obj, key) => obj?.[key], errors)?.message;
  };

  const error = getErrorMessage(name, errors);

  return (
    <Input
      label={label}
      type={type}
      placeholder={placeholder}
      icon={icon}
      error={error}
      className={className}
      // Pass all properties from react-hook-form (ref, onChange, onBlur)
      {...register(name)}
      {...props}
    />
  );
};

export default FormInput;