import React from 'react';

const Skeleton = ({ 
  variant = 'rect', // rect, circle, text
  width, 
  height, 
  className = '' 
}) => {
  
  // Base pulsing animation and background
  const baseStyles = "animate-pulse bg-slate-200";

  // Variant shapes
  const variants = {
    // For profile pictures or icons
    circle: "rounded-full",
    // For standard cards or image placeholders
    rect: "rounded-2xl",
    // For lines of text
    text: "rounded-md h-3 w-full mb-2",
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? undefined : '100%'),
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;