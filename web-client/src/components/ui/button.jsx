import React from 'react';

export const Button = ({ 
  children, 
  variant = "default", 
  size = "md", 
  className = "", 
  leftIcon = null,
  rightIcon = null,
  ...props 
}) => {
  const variantClasses = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    ghost: "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
    link: "text-blue-600 hover:underline dark:text-blue-400",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors rounded-md ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};