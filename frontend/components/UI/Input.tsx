'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, X } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'flushed';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success' | 'warning';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    variant = 'default',
    size = 'md',
    state = 'default',
    leftIcon,
    rightIcon,
    clearable = false,
    onClear,
    disabled,
    value,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Handle clear input
    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    // Base input styles
    const baseStyles = [
      'w-full transition-all duration-200',
      'border border-neutral-300 bg-white',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'placeholder:text-neutral-400',
    ];

    // Variant styles
    const variantStyles = {
      default: [
        'rounded-lg',
      ],
      filled: [
        'bg-neutral-100 border-transparent',
        'focus:bg-white focus:border-neutral-300',
        'rounded-lg',
      ],
      flushed: [
        'bg-transparent border-x-0 border-t-0 border-b-2',
        'rounded-none px-0',
        'focus:ring-0',
      ],
    };

    // Size styles
    const sizeStyles = {
      sm: ['text-sm h-8', leftIcon || rightIcon || clearable ? 'px-3' : 'px-3'],
      md: ['text-base h-10', leftIcon || rightIcon || clearable ? 'px-4' : 'px-4'],
      lg: ['text-lg h-12', leftIcon || rightIcon || clearable ? 'px-5' : 'px-5'],
    };

    // State styles
    const stateStyles = {
      default: [
        'border-neutral-300',
        'focus:border-primary-500 focus:ring-primary-500',
      ],
      error: [
        'border-error-300 bg-error-50',
        'focus:border-error-500 focus:ring-error-500',
      ],
      success: [
        'border-success-300 bg-success-50',
        'focus:border-success-500 focus:ring-success-500',
      ],
      warning: [
        'border-warning-300 bg-warning-50',
        'focus:border-warning-500 focus:ring-warning-500',
      ],
    };

    // Icon sizes
    const iconSizes = {
      sm: 16,
      md: 18,
      lg: 20,
    };

    // Padding adjustments for icons
    const leftPadding = leftIcon ? (size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-12' : 'pl-10') : '';
    const rightPadding = (rightIcon || clearable || type === 'password') 
      ? (size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-12' : 'pr-10') 
      : '';

    // Combine all styles
    const inputStyles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      stateStyles[state],
      leftPadding,
      rightPadding,
      className
    );

    // Container styles for positioning icons
    const containerStyles = cn('relative flex items-center');

    // Icon container styles
    const iconContainerStyles = cn(
      'absolute flex items-center justify-center',
      'text-neutral-400',
      size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
    );

    return (
      <div className={containerStyles}>
        {/* Left Icon */}
        {leftIcon && (
          <div className={cn(iconContainerStyles, 'left-0')}>
            <span style={{ fontSize: iconSizes[size] }}>
              {leftIcon}
            </span>
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          className={inputStyles}
          disabled={disabled}
          value={value}
          {...props}
        />

        {/* Right Icons */}
        <div className={cn(iconContainerStyles, 'right-0', 'flex items-center gap-1')}>
          {/* Clear Button */}
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-neutral-100 rounded-sm transition-colors"
              tabIndex={-1}
            >
              <X size={iconSizes[size] - 2} />
            </button>
          )}

          {/* Password Visibility Toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="p-1 hover:bg-neutral-100 rounded-sm transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={iconSizes[size]} />
              ) : (
                <Eye size={iconSizes[size]} />
              )}
            </button>
          )}

          {/* Custom Right Icon */}
          {rightIcon && (
            <span style={{ fontSize: iconSizes[size] }}>
              {rightIcon}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;