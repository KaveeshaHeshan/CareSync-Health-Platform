import React from 'react';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  circle = false,
  count = 1,
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-gray-200';

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'title':
        return 'h-6 rounded';
      case 'heading':
        return 'h-8 rounded';
      case 'button':
        return 'h-10 rounded-lg';
      case 'avatar':
        return 'h-10 w-10 rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'h-48 rounded-lg';
      default:
        return 'rounded';
    }
  };

  const shapeStyles = circle ? 'rounded-full' : '';
  const widthStyle = width ? { width } : {};
  const heightStyle = height ? { height } : {};
  const inlineStyles = { ...widthStyle, ...heightStyle };

  const combinedClassName = `
    ${baseStyles}
    ${getVariantStyles()}
    ${shapeStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={combinedClassName}
            style={inlineStyles}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={combinedClassName}
      style={inlineStyles}
      {...props}
    />
  );
};

// Card Skeleton - Pre-built skeleton for card loading states
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Skeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="title" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
          </div>
          <div className="flex space-x-2">
            <Skeleton variant="button" width="100px" />
            <Skeleton variant="button" width="100px" />
          </div>
        </div>
      ))}
    </>
  );
};

// Table Skeleton - Pre-built skeleton for table loading states
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="title" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" />
          ))}
        </div>
      ))}
    </div>
  );
};

// List Skeleton - Pre-built skeleton for list loading states
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Profile Skeleton - Pre-built skeleton for profile page
export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton circle width="96px" height="96px" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="heading" width="200px" />
          <Skeleton variant="text" width="300px" />
          <Skeleton variant="button" width="120px" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton variant="title" width="150px" />
          <Skeleton variant="text" count={4} />
        </div>
        <div className="space-y-3">
          <Skeleton variant="title" width="150px" />
          <Skeleton variant="text" count={4} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
