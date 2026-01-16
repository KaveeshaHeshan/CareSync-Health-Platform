import React from 'react';
import { X } from 'lucide-react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  removable = false,
  onRemove,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium';

  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800',
    secondary: 'bg-gray-200 text-gray-700',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    dark: 'bg-gray-800 text-white',
    outline: 'bg-transparent border border-gray-300 text-gray-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const roundedStyles = rounded ? 'rounded-full' : 'rounded';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${roundedStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={combinedClassName} {...props}>
      {Icon && (
        <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${children ? 'mr-1' : ''}`} />
      )}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          <X className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
        </button>
      )}
    </span>
  );
};

// Status Badge - Pre-configured for appointment/order statuses
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    // Appointment statuses
    PENDING: { variant: 'warning', text: 'Pending' },
    CONFIRMED: { variant: 'info', text: 'Confirmed' },
    COMPLETED: { variant: 'success', text: 'Completed' },
    CANCELLED: { variant: 'danger', text: 'Cancelled' },
    RESCHEDULED: { variant: 'warning', text: 'Rescheduled' },
    
    // Payment statuses
    PAID: { variant: 'success', text: 'Paid' },
    UNPAID: { variant: 'danger', text: 'Unpaid' },
    REFUNDED: { variant: 'info', text: 'Refunded' },
    PROCESSING: { variant: 'warning', text: 'Processing' },
    
    // Order statuses
    ACTIVE: { variant: 'success', text: 'Active' },
    INACTIVE: { variant: 'default', text: 'Inactive' },
    APPROVED: { variant: 'success', text: 'Approved' },
    REJECTED: { variant: 'danger', text: 'Rejected' },
  };

  const config = statusConfig[status] || { variant: 'default', text: status };

  return (
    <Badge variant={config.variant} size="sm">
      {config.text}
    </Badge>
  );
};

// Role Badge - Pre-configured for user roles
export const RoleBadge = ({ role }) => {
  const roleConfig = {
    PATIENT: { variant: 'primary', text: 'Patient' },
    DOCTOR: { variant: 'success', text: 'Doctor' },
    ADMIN: { variant: 'danger', text: 'Admin' },
  };

  const config = roleConfig[role] || { variant: 'default', text: role };

  return (
    <Badge variant={config.variant} size="sm">
      {config.text}
    </Badge>
  );
};

export default Badge;
