'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'neutral';
  centered?: boolean;
  overlay?: boolean;
  text?: string;
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({
    className,
    size = 'md',
    variant = 'primary',
    centered = false,
    overlay = false,
    text,
    ...props
  }, ref) => {
    // Size styles
    const sizeStyles = {
      xs: { spinner: 'w-3 h-3', text: 'text-xs' },
      sm: { spinner: 'w-4 h-4', text: 'text-sm' },
      md: { spinner: 'w-6 h-6', text: 'text-base' },
      lg: { spinner: 'w-8 h-8', text: 'text-lg' },
      xl: { spinner: 'w-12 h-12', text: 'text-xl' },
    };

    // Variant styles
    const variantStyles = {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      neutral: 'text-neutral-500',
    };

    // Container styles
    const containerBaseStyles = ['inline-flex items-center gap-2'];
    
    const containerStyles = cn(
      containerBaseStyles,
      centered && 'justify-center',
      overlay && [
        'fixed inset-0 z-50',
        'bg-white/80 backdrop-blur-sm',
        'flex items-center justify-center',
      ],
      className
    );

    // Spinner styles
    const spinnerStyles = cn(
      'animate-spin',
      sizeStyles[size].spinner,
      variantStyles[variant]
    );

    // Text styles
    const textStyles = cn(
      sizeStyles[size].text,
      variantStyles[variant],
      'font-medium'
    );

    return (
      <div ref={ref} className={containerStyles} {...props}>
        <Loader2 className={spinnerStyles} />
        {text && (
          <span className={textStyles}>
            {text}
          </span>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Spinner-only component for inline use
export interface SpinnerProps extends Omit<LoadingSpinnerProps, 'text' | 'centered' | 'overlay'> {}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'primary', ...props }, ref) => {
    const sizeMap = {
      xs: 12,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
    };

    const variantStyles = {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      neutral: 'text-neutral-500',
    };

    return (
      <Loader2
        ref={ref}
        size={sizeMap[size]}
        className={cn('animate-spin', variantStyles[variant], className)}
        {...(props as any)}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export default LoadingSpinner;