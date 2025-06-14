'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  divider?: React.ReactNode;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({
    className,
    direction = 'vertical',
    spacing = 'md',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    divider,
    children,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = ['flex'];

    // Direction styles
    const directionStyles = {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    };

    // Spacing styles
    const spacingStyles = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    };

    // Align styles (cross-axis)
    const alignStyles = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    // Justify styles (main-axis)
    const justifyStyles = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    // Wrap styles
    const wrapStyles = wrap ? 'flex-wrap' : 'flex-nowrap';

    // Combine all styles
    const stackStyles = cn(
      baseStyles,
      directionStyles[direction],
      spacingStyles[spacing],
      alignStyles[align],
      justifyStyles[justify],
      wrapStyles,
      className
    );

    // Process children with dividers
    const processedChildren = React.useMemo(() => {
      if (!divider) return children;

      const childArray = React.Children.toArray(children);
      const result: React.ReactNode[] = [];

      childArray.forEach((child, index) => {
        result.push(child);
        
        // Add divider between children (not after the last one)
        if (index < childArray.length - 1) {
          result.push(
            <div key={`divider-${index}`} className="flex-shrink-0">
              {divider}
            </div>
          );
        }
      });

      return result;
    }, [children, divider]);

    return (
      <div ref={ref} className={stackStyles} {...props}>
        {processedChildren}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// Vertical Stack (VStack) - Convenience component
export interface VStackProps extends Omit<StackProps, 'direction'> {}

export const VStack = forwardRef<HTMLDivElement, VStackProps>(
  (props, ref) => {
    return <Stack ref={ref} direction="vertical" {...props} />;
  }
);

VStack.displayName = 'VStack';

// Horizontal Stack (HStack) - Convenience component
export interface HStackProps extends Omit<StackProps, 'direction'> {}

export const HStack = forwardRef<HTMLDivElement, HStackProps>(
  (props, ref) => {
    return <Stack ref={ref} direction="horizontal" {...props} />;
  }
);

HStack.displayName = 'HStack';

export default Stack;