import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  headerAction, // For a button or "See All" link in the top right
  footer, 
  className = '', 
  noPadding = false,
  hoverable = false 
}) => {
  return (
    <div className={`
      bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col
      ${hoverable ? 'hover:shadow-md hover:-translate-y-1 transition-all duration-300' : ''}
      ${className}
    `}>
      {/* Card Header */}
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className={`flex-1 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;