'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    interactive = false,
    children,
    ...props
  }, ref) => {
    // Base card styles
    const baseStyles = [
      'bg-white',
      'transition-all duration-200',
    ];

    // Variant styles
    const variantStyles = {
      default: [
        'border border-neutral-200',
        'rounded-lg',
      ],
      outlined: [
        'border-2 border-neutral-300',
        'rounded-lg',
      ],
      elevated: [
        'border border-neutral-200',
        'rounded-lg',
        'shadow-md',
      ],
      ghost: [
        'border-0',
        'rounded-lg',
        'bg-transparent',
      ],
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    // Interactive styles
    const interactiveStyles = interactive ? [
      'cursor-pointer',
      'hover:shadow-lg hover:scale-[1.02]',
      'active:scale-[0.98]',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    ] : [];

    // Combine all styles
    const cardStyles = cn(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      interactiveStyles,
      className
    );

    if (interactive) {
      return (
        <button
          ref={ref as any}
          className={cardStyles}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }

    return (
      <div
        ref={ref as any}
        className={cardStyles}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({
    className,
    title,
    description,
    action,
    children,
    ...props
  }, ref) => {
    const headerStyles = cn(
      'flex flex-col space-y-1.5',
      'pb-4 border-b border-neutral-200',
      className
    );

    return (
      <div ref={ref} className={headerStyles} {...props}>
        {(title || action) && (
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight text-neutral-900">
                {title}
              </h3>
            )}
            {action && (
              <div className="flex items-center space-x-2">
                {action}
              </div>
            )}
          </div>
        )}
        {description && (
          <p className="text-sm text-neutral-600">
            {description}
          </p>
        )}
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    const contentStyles = cn('pt-4', className);

    return (
      <div ref={ref} className={contentStyles} {...props} />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    const footerStyles = cn(
      'flex items-center justify-between',
      'pt-4 border-t border-neutral-200',
      className
    );

    return (
      <div ref={ref} className={footerStyles} {...props} />
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;