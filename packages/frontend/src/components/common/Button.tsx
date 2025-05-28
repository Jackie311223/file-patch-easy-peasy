import React from 'react';

// Simple SVG Spinner component
const Spinner: React.FC<{ size?: string; color?: string }> = ({ size = 'h-5 w-5', color = 'currentColor' }) => (
  <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean; // Add isLoading prop
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  isLoading = false, // Default to false
  className = '',
  children,
  disabled,
  ...props
}) => {
  // Base styles
  let baseClasses = 'inline-flex items-center justify-center border font-button rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150';

  // Size styles
  let sizeClasses = '';
  switch (size) {
    case 'small':
      sizeClasses = 'h-8 px-md text-sm'; // Adjusted height and padding
      break;
    case 'large':
      sizeClasses = 'h-11 px-xl text-base'; // Adjusted height and padding
      break;
    case 'medium':
    default:
      sizeClasses = 'h-9 px-lg text-button'; // Default: 36px height, 16px padding
      break;
  }

  // Variant styles
  let variantClasses = '';
  switch (variant) {
    case 'secondary':
      variantClasses = 'border-background-muted bg-white text-primary hover:bg-primary/5 disabled:bg-white disabled:border-background-muted disabled:text-text-muted';
      break;
    case 'text':
      variantClasses = 'border-transparent bg-transparent text-primary hover:bg-primary/5 disabled:bg-transparent disabled:text-text-muted';
      break;
    case 'destructive':
      variantClasses = 'border-transparent bg-error text-white hover:bg-error-dark focus:ring-error/50 disabled:bg-error/70';
      break;
    case 'primary':
    default:
      variantClasses = 'border-transparent bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 disabled:bg-primary/70';
      break;
  }

  const iconSpacing = children ? 'mr-sm' : ''; // Add margin if there is text
  const rightIconSpacing = children ? 'ml-sm' : '';

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === 'small' ? 'h-4 w-4' : 'h-5 w-5'} />
      ) : (
        <>
          {leftIcon && <span className={iconSpacing}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={rightIconSpacing}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

