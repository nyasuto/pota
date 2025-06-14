'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centerContent?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className,
    size = 'lg',
    padding = 'md',
    centerContent = false,
    children,
    ...props
  }, ref) => {
    // Size styles - max width and responsive behavior
    const sizeStyles = {
      sm: 'max-w-2xl',     // 672px
      md: 'max-w-4xl',     // 896px  
      lg: 'max-w-6xl',     // 1152px
      xl: 'max-w-7xl',     // 1280px
      full: 'max-w-full',  // 100%
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'px-4 py-2',
      md: 'px-6 py-4',
      lg: 'px-8 py-6',
    };

    // Center content styles
    const centerStyles = centerContent ? 'mx-auto' : '';

    // Combine all styles
    const containerStyles = cn(
      'w-full',
      sizeStyles[size],
      paddingStyles[padding],
      centerStyles,
      className
    );

    return (
      <div ref={ref} className={containerStyles} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;