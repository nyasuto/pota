'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto' | 'fit';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
  autoRows?: 'auto' | 'min' | 'max' | 'fr';
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    className,
    cols = 1,
    gap = 'md',
    responsive,
    autoRows = 'auto',
    children,
    ...props
  }, ref) => {
    // Base grid styles
    const baseStyles = ['grid'];

    // Column styles
    const colStyles = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
      auto: 'grid-cols-auto',
      fit: 'grid-cols-fit',
    };

    // Gap styles
    const gapStyles = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    // Auto rows styles
    const autoRowsStyles = {
      auto: 'auto-rows-auto',
      min: 'auto-rows-min',
      max: 'auto-rows-max', 
      fr: 'auto-rows-fr',
    };

    // Responsive column styles
    const responsiveStyles = [];
    if (responsive) {
      if (responsive.sm) responsiveStyles.push(`sm:grid-cols-${responsive.sm}`);
      if (responsive.md) responsiveStyles.push(`md:grid-cols-${responsive.md}`);
      if (responsive.lg) responsiveStyles.push(`lg:grid-cols-${responsive.lg}`);
      if (responsive.xl) responsiveStyles.push(`xl:grid-cols-${responsive.xl}`);
    }

    // Combine all styles
    const gridStyles = cn(
      baseStyles,
      colStyles[cols],
      gapStyles[gap],
      autoRowsStyles[autoRows],
      responsiveStyles,
      className
    );

    return (
      <div ref={ref} className={gridStyles} {...props}>
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item Component
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto' | 'full';
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto' | 'full';
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  rowEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({
    className,
    colSpan,
    rowSpan,
    colStart,
    rowStart,
    colEnd,
    rowEnd,
    children,
    ...props
  }, ref) => {
    // Column span styles
    const colSpanStyles = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      12: 'col-span-12',
      auto: 'col-auto',
      full: 'col-span-full',
    };

    // Row span styles
    const rowSpanStyles = {
      1: 'row-span-1',
      2: 'row-span-2',
      3: 'row-span-3',
      4: 'row-span-4',
      5: 'row-span-5',
      6: 'row-span-6',
      auto: 'row-auto',
      full: 'row-span-full',
    };

    // Column start styles
    const colStartStyles = {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
      7: 'col-start-7',
      8: 'col-start-8',
      9: 'col-start-9',
      10: 'col-start-10',
      11: 'col-start-11',
      12: 'col-start-12',
      13: 'col-start-13',
      auto: 'col-start-auto',
    };

    // Row start styles
    const rowStartStyles = {
      1: 'row-start-1',
      2: 'row-start-2',
      3: 'row-start-3',
      4: 'row-start-4',
      5: 'row-start-5',
      6: 'row-start-6',
      7: 'row-start-7',
      auto: 'row-start-auto',
    };

    // Column end styles
    const colEndStyles = {
      1: 'col-end-1',
      2: 'col-end-2',
      3: 'col-end-3',
      4: 'col-end-4',
      5: 'col-end-5',
      6: 'col-end-6',
      7: 'col-end-7',
      8: 'col-end-8',
      9: 'col-end-9',
      10: 'col-end-10',
      11: 'col-end-11',
      12: 'col-end-12',
      13: 'col-end-13',
      auto: 'col-end-auto',
    };

    // Row end styles
    const rowEndStyles = {
      1: 'row-end-1',
      2: 'row-end-2',
      3: 'row-end-3',
      4: 'row-end-4',
      5: 'row-end-5',
      6: 'row-end-6',
      7: 'row-end-7',
      auto: 'row-end-auto',
    };

    // Combine all styles
    const itemStyles = cn(
      colSpan && colSpanStyles[colSpan],
      rowSpan && rowSpanStyles[rowSpan],
      colStart && colStartStyles[colStart],
      rowStart && rowStartStyles[rowStart],
      colEnd && colEndStyles[colEnd],
      rowEnd && rowEndStyles[rowEnd],
      className
    );

    return (
      <div ref={ref} className={itemStyles} {...props}>
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

export default Grid;