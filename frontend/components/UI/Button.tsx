'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }, ref) => {
    // Base button styles
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'border border-transparent',
    ];

    // Variant styles
    const variantStyles = {
      primary: [
        'bg-primary-500 text-white',
        'hover:bg-primary-600 active:bg-primary-700',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-secondary-500 text-white',
        'hover:bg-secondary-600 active:bg-secondary-700',
        'focus:ring-secondary-500',
        'shadow-sm hover:shadow-md',
      ],
      outline: [
        'border-neutral-300 text-neutral-700 bg-white',
        'hover:bg-neutral-50 active:bg-neutral-100',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-md',
      ],
      ghost: [
        'text-neutral-700 bg-transparent',
        'hover:bg-neutral-100 active:bg-neutral-200',
        'focus:ring-primary-500',
      ],
      danger: [
        'bg-error-500 text-white',
        'hover:bg-error-600 active:bg-error-700',
        'focus:ring-error-500',
        'shadow-sm hover:shadow-md',
      ],
    };

    // Size styles
    const sizeStyles = {
      sm: ['text-sm px-3 py-2 h-8 rounded-md'],
      md: ['text-base px-4 py-2.5 h-10 rounded-lg'],
      lg: ['text-lg px-6 py-3 h-12 rounded-lg'],
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine all styles
    const buttonStyles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyles,
      className
    );

    // Icon size based on button size
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

    // Loading spinner size
    const spinnerSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return (
      <button
        ref={ref}
        className={buttonStyles}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 
            className="animate-spin" 
            size={spinnerSize}
            aria-hidden="true"
          />
        )}
        
        {!loading && leftIcon && (
          <span className="flex-shrink-0" style={{ fontSize: iconSize }}>
            {leftIcon}
          </span>
        )}
        
        <span className={loading && !loadingText ? 'sr-only' : ''}>
          {loading && loadingText ? loadingText : children}
        </span>
        
        {!loading && rightIcon && (
          <span className="flex-shrink-0" style={{ fontSize: iconSize }}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;