'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'white' | 'neutral' | 'primary' | 'secondary';
  centered?: boolean;
  fullHeight?: boolean;
  as?: 'section' | 'div' | 'main' | 'article' | 'aside';
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({
    className,
    variant = 'default',
    padding = 'lg',
    spacing = 'md',
    background = 'transparent',
    centered = false,
    fullHeight = false,
    as: Component = 'section',
    children,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = ['w-full'];

    // Variant styles - affects text and border colors
    const variantStyles = {
      default: 'text-neutral-900',
      primary: 'text-primary-900',
      secondary: 'text-secondary-900',
      muted: 'text-neutral-600',
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'py-4 px-4',
      md: 'py-8 px-6',
      lg: 'py-12 px-8',
      xl: 'py-16 px-10',
    };

    // Spacing styles for child elements
    const spacingStyles = {
      none: '',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8',
    };

    // Background styles
    const backgroundStyles = {
      transparent: 'bg-transparent',
      white: 'bg-white',
      neutral: 'bg-neutral-50',
      primary: 'bg-primary-50',
      secondary: 'bg-secondary-50',
    };

    // Center content styles
    const centerStyles = centered ? 'flex flex-col items-center justify-center text-center' : '';

    // Full height styles
    const heightStyles = fullHeight ? 'min-h-screen' : '';

    // Combine all styles
    const sectionStyles = cn(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      spacingStyles[spacing],
      backgroundStyles[background],
      centerStyles,
      heightStyles,
      className
    );

    return (
      <Component ref={ref as any} className={sectionStyles} {...props}>
        {children}
      </Component>
    );
  }
);

Section.displayName = 'Section';

// Section Header Component
export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({
    className,
    title,
    subtitle,
    description,
    action,
    size = 'md',
    align = 'left',
    children,
    ...props
  }, ref) => {
    // Size styles
    const sizeStyles = {
      sm: {
        title: 'text-xl font-semibold',
        subtitle: 'text-sm text-neutral-600',
        description: 'text-sm text-neutral-600',
      },
      md: {
        title: 'text-2xl font-bold',
        subtitle: 'text-base text-neutral-600',
        description: 'text-base text-neutral-600',
      },
      lg: {
        title: 'text-3xl font-bold',
        subtitle: 'text-lg text-neutral-600',
        description: 'text-lg text-neutral-600',
      },
    };

    // Alignment styles
    const alignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    // Container alignment styles
    const containerAlignStyles = {
      left: 'items-start',
      center: 'items-center',
      right: 'items-end',
    };

    const headerStyles = cn(
      'flex flex-col space-y-2',
      containerAlignStyles[align],
      className
    );

    return (
      <div ref={ref} className={headerStyles} {...props}>
        {(title || action) && (
          <div className={cn(
            'w-full flex items-start justify-between gap-4',
            align === 'center' ? 'flex-col items-center' : 'items-start'
          )}>
            <div className={cn('flex flex-col space-y-1', alignStyles[align])}>
              {subtitle && (
                <p className={sizeStyles[size].subtitle}>
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className={cn(sizeStyles[size].title, 'text-neutral-900')}>
                  {title}
                </h2>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        )}
        
        {description && (
          <p className={cn(sizeStyles[size].description, alignStyles[align])}>
            {description}
          </p>
        )}
        
        {children}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';

export default Section;