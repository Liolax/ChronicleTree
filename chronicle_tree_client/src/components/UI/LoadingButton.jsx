import React from 'react';
import { FaSpinner } from 'react-icons/fa';

// Utility to combine classes
const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

// Button variant styles
const buttonVariants = {
  primary: 'bg-slate-900 text-slate-50 hover:bg-slate-900/90',
  destructive: 'bg-red-500 text-slate-50 hover:bg-red-500/90',
  outline: 'border border-slate-200 bg-transparent hover:bg-slate-100 hover:text-slate-900',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
  ghost: 'hover:bg-slate-100 hover:text-slate-900',
  link: 'text-slate-900 underline-offset-4 hover:underline',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const LoadingButton = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  children, 
  isLoading, 
  loadingText = 'Loading...', 
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  return (
    <button
      className={cn(
        baseClasses,
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? loadingText : children}
    </button>
  );
});

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;