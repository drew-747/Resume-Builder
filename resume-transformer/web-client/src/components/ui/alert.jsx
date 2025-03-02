import React from 'react';

export const Alert = ({ children, variant = "default", className = "", ...props }) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <div
      className={`flex items-center p-4 mb-4 rounded-lg border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`font-medium ml-2 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const AlertDescription = ({ children, className = "", ...props }) => {
  return (
    <div className={`ml-2 ${className}`} {...props}>
      {children}
    </div>
  );
};