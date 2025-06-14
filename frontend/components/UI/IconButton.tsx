'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'square' | 'rounded' | 'circle';
  loading?: boolean;
  icon: React.ReactNode;
  label?: string; // For accessibility
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    loading = false,
    disabled,
    icon,
    label,
    ...props
  }, ref) => {
    // Base button styles
    const baseStyles = [
      'inline-flex items-center justify-center',
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
      xs: ['w-6 h-6', '[&>svg]:w-3 [&>svg]:h-3'],
      sm: ['w-8 h-8', '[&>svg]:w-4 [&>svg]:h-4'],
      md: ['w-10 h-10', '[&>svg]:w-5 [&>svg]:h-5'],
      lg: ['w-12 h-12', '[&>svg]:w-6 [&>svg]:h-6'],
      xl: ['w-14 h-14', '[&>svg]:w-7 [&>svg]:h-7'],
    };

    // Shape styles
    const shapeStyles = {
      square: 'rounded-none',
      rounded: 'rounded-lg',
      circle: 'rounded-full',
    };

    // Loading spinner size
    const spinnerSizes = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    };

    // Combine all styles
    const buttonStyles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      shapeStyles[shape],
      className
    );

    return (
      <button
        ref={ref}
        className={buttonStyles}
        disabled={disabled || loading}
        aria-label={label}
        {...props}
      >
        {loading ? (
          <Loader2 
            size={spinnerSizes[size]}
            className="animate-spin" 
            aria-hidden="true"
          />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Toggle Icon Button - for states like favorite, bookmark, etc.
export interface ToggleIconButtonProps extends Omit<IconButtonProps, 'icon'> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
  labelOn?: string;
  labelOff?: string;
}

export const ToggleIconButton = forwardRef<HTMLButtonElement, ToggleIconButtonProps>(
  ({
    pressed = false,
    onPressedChange,
    iconOn,
    iconOff,
    labelOn,
    labelOff,
    onClick,
    ...props
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPressedChange?.(!pressed);
      onClick?.(event);
    };

    return (
      <IconButton
        ref={ref}
        icon={pressed ? iconOn : iconOff}
        label={pressed ? labelOn : labelOff}
        onClick={handleClick}
        aria-pressed={pressed}
        {...props}
      />
    );
  }
);

ToggleIconButton.displayName = 'ToggleIconButton';

export default IconButton;