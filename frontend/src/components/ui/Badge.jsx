import React from 'react';

const Badge = ({ 
  children, 
  variant = 'neutral', // success, warning, danger, info, neutral
  size = 'md',        // sm, md
  className = '',
  dot = false         // Optional status dot
}) => {
  
  // Base styles
  const baseStyles = "inline-flex items-center font-bold rounded-full transition-colors duration-200";

  // Variant styles (Subtle theme)
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    neutral: "bg-slate-50 text-slate-600 border border-slate-200",
  };

  // Dot colors (for the optional dot)
  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-indigo-500",
    neutral: "bg-slate-400",
  };

  // Size styles
  const sizes = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;