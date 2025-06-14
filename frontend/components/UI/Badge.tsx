'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    dot = false,
    removable = false,
    onRemove,
    icon,
    children,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = [
      'inline-flex items-center gap-1',
      'font-medium transition-colors',
      'border',
    ];

    // Variant styles
    const variantStyles = {
      primary: [
        'bg-primary-100 text-primary-800 border-primary-200',
        'hover:bg-primary-200',
      ],
      secondary: [
        'bg-secondary-100 text-secondary-800 border-secondary-200',
        'hover:bg-secondary-200',
      ],
      success: [
        'bg-success-100 text-success-800 border-success-200',
        'hover:bg-success-200',
      ],
      warning: [
        'bg-warning-100 text-warning-800 border-warning-200',
        'hover:bg-warning-200',
      ],
      error: [
        'bg-error-100 text-error-800 border-error-200',
        'hover:bg-error-200',
      ],
      neutral: [
        'bg-neutral-100 text-neutral-800 border-neutral-200',
        'hover:bg-neutral-200',
      ],
      outline: [
        'bg-transparent text-neutral-700 border-neutral-300',
        'hover:bg-neutral-50',
      ],
    };

    // Size styles
    const sizeStyles = {
      sm: ['text-xs px-2 py-0.5 h-5'],
      md: ['text-sm px-2.5 py-1 h-6'],
      lg: ['text-base px-3 py-1.5 h-8'],
    };

    // Shape styles
    const shapeStyles = {
      rounded: 'rounded',
      pill: 'rounded-full',
      square: 'rounded-none',
    };

    // Dot variant overrides
    const dotStyles = dot ? [
      'w-2 h-2 p-0 rounded-full',
      'border-0',
    ] : [];

    // Icon sizes based on badge size
    const iconSizes = {
      sm: 12,
      md: 14,
      lg: 16,
    };

    // Combine all styles
    const badgeStyles = cn(
      baseStyles,
      variantStyles[variant],
      !dot && sizeStyles[size],
      !dot && shapeStyles[shape],
      dotStyles,
      className
    );

    // If it's a dot badge, just return the dot
    if (dot) {
      return (
        <span ref={ref} className={badgeStyles} {...props} />
      );
    }

    return (
      <span ref={ref} className={badgeStyles} {...props}>
        {icon && (
          <span className="flex-shrink-0" style={{ fontSize: iconSizes[size] }}>
            {icon}
          </span>
        )}
        
        {children}
        
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'flex-shrink-0 ml-1 -mr-1',
              'rounded-full p-0.5',
              'hover:bg-black/10 transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-current'
            )}
            aria-label="削除"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Specialized badge for course difficulties
export interface DifficultyBadgeProps extends Omit<BadgeProps, 'variant'> {
  difficulty: 'easy' | 'moderate' | 'hard';
}

export const DifficultyBadge = forwardRef<HTMLSpanElement, DifficultyBadgeProps>(
  ({ difficulty, ...props }, ref) => {
    const variantMap = {
      easy: 'success' as const,
      moderate: 'warning' as const,
      hard: 'error' as const,
    };

    const labelMap = {
      easy: '簡単',
      moderate: '普通',
      hard: '難しい',
    };

    return (
      <Badge
        ref={ref}
        variant={variantMap[difficulty]}
        {...props}
      >
        {labelMap[difficulty]}
      </Badge>
    );
  }
);

DifficultyBadge.displayName = 'DifficultyBadge';

// Specialized badge for course types
export interface CourseTypeBadgeProps extends Omit<BadgeProps, 'variant'> {
  courseType: 'walking' | 'cycling' | 'jogging';
}

export const CourseTypeBadge = forwardRef<HTMLSpanElement, CourseTypeBadgeProps>(
  ({ courseType, ...props }, ref) => {
    const labelMap = {
      walking: '散歩',
      cycling: 'サイクリング',
      jogging: 'ジョギング',
    };

    const iconMap = {
      walking: '🚶',
      cycling: '🚴',
      jogging: '🏃',
    };

    return (
      <Badge
        ref={ref}
        variant="outline"
        icon={iconMap[courseType]}
        {...props}
      >
        {labelMap[courseType]}
      </Badge>
    );
  }
);

CourseTypeBadge.displayName = 'CourseTypeBadge';

export default Badge;