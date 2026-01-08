import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ 
  size = 'md',        // sm, md, lg, xl
  color = 'primary',   // primary, white, slate
  className = '',
  label = 'Loading...' // For accessibility
}) => {
  
  // Size mapping
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Color mapping
  const colors = {
    primary: 'text-indigo-600',
    white: 'text-white',
    slate: 'text-slate-400',
  };

  return (
    <div role="status" className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 
        className={`animate-spin ${sizes[size]} ${colors[color]}`} 
      />
      {/* Hidden label for Screen Readers (Accessibility) */}
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;