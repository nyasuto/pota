'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'default' | 'filled' | 'flushed';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success' | 'warning';
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    state = 'default',
    options,
    placeholder = '選択してください',
    leftIcon,
    disabled,
    ...props
  }, ref) => {
    // Base select styles
    const baseStyles = [
      'w-full transition-all duration-200',
      'border border-neutral-300 bg-white',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'appearance-none cursor-pointer',
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
      sm: ['text-sm h-8', leftIcon ? 'pl-9 pr-8' : 'px-3 pr-8'],
      md: ['text-base h-10', leftIcon ? 'pl-10 pr-10' : 'px-4 pr-10'],
      lg: ['text-lg h-12', leftIcon ? 'pl-12 pr-12' : 'px-5 pr-12'],
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

    // Combine all styles
    const selectStyles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      stateStyles[state],
      className
    );

    // Container styles for positioning icons
    const containerStyles = cn('relative flex items-center');

    // Icon container styles
    const iconContainerStyles = cn(
      'absolute flex items-center justify-center pointer-events-none',
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

        {/* Select Field */}
        <select
          ref={ref}
          className={selectStyles}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron Down Icon */}
        <div className={cn(iconContainerStyles, 'right-0')}>
          <ChevronDown size={iconSizes[size]} />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

// Custom Select Component with better styling and interaction
export interface CustomSelectProps extends Omit<SelectProps, 'options'> {
  options: SelectOption[];
  onValueChange?: (value: string) => void;
  searchable?: boolean;
  multiple?: boolean;
}

export const CustomSelect = forwardRef<HTMLDivElement, CustomSelectProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    state = 'default',
    options,
    placeholder = '選択してください',
    leftIcon,
    disabled,
    value,
    onValueChange,
    searchable = false,
    multiple = false,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      multiple ? (Array.isArray(value) ? value : []) : (value ? [value as string] : [])
    );

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options;
      return options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm]);

    // Handle option selection
    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue];
        setSelectedValues(newValues);
        onValueChange?.(newValues.join(','));
      } else {
        setSelectedValues([optionValue]);
        onValueChange?.(optionValue);
        setIsOpen(false);
      }
    };

    // Get display text
    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder;
      
      if (multiple) {
        if (selectedValues.length === 1) {
          const option = options.find(o => o.value === selectedValues[0]);
          return option?.label || selectedValues[0];
        }
        return `${selectedValues.length}個選択中`;
      }
      
      const option = options.find(o => o.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    };

    // Base styles
    const triggerStyles = cn(
      'w-full flex items-center justify-between',
      'border border-neutral-300 bg-white',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'cursor-pointer transition-all duration-200',
      size === 'sm' ? 'text-sm h-8 px-3' : 
      size === 'lg' ? 'text-lg h-12 px-5' : 'text-base h-10 px-4',
      variant === 'filled' ? 'bg-neutral-100 border-transparent focus:bg-white focus:border-neutral-300' : '',
      variant === 'flushed' ? 'bg-transparent border-x-0 border-t-0 border-b-2 rounded-none px-0 focus:ring-0' : 'rounded-lg',
      state === 'error' ? 'border-error-300 bg-error-50 focus:border-error-500 focus:ring-error-500' :
      state === 'success' ? 'border-success-300 bg-success-50 focus:border-success-500 focus:ring-success-500' :
      state === 'warning' ? 'border-warning-300 bg-warning-50 focus:border-warning-500 focus:ring-warning-500' :
      'focus:border-primary-500 focus:ring-primary-500',
      leftIcon ? (size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-12' : 'pl-10') : '',
      className
    );

    const dropdownStyles = cn(
      'absolute top-full left-0 right-0 z-50 mt-1',
      'bg-white border border-neutral-200 rounded-lg shadow-lg',
      'max-h-60 overflow-y-auto'
    );

    const optionStyles = cn(
      'px-4 py-2 text-sm cursor-pointer',
      'hover:bg-neutral-50 transition-colors',
      'flex items-center justify-between'
    );

    return (
      <div ref={ref} className="relative" {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {/* Left Icon */}
        {leftIcon && (
          <div className={cn(
            'absolute left-0 flex items-center justify-center pointer-events-none z-10',
            'text-neutral-400',
            size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
          )}>
            <span>{leftIcon}</span>
          </div>
        )}

        {/* Trigger */}
        <button
          type="button"
          className={triggerStyles}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={cn(
            'truncate text-left',
            selectedValues.length === 0 ? 'text-neutral-400' : 'text-neutral-900'
          )}>
            {getDisplayText()}
          </span>
          <ChevronDown 
            size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
            className={cn(
              'text-neutral-400 transition-transform',
              isOpen ? 'rotate-180' : ''
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className={dropdownStyles}>
            {searchable && (
              <div className="p-2 border-b border-neutral-200">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                {searchTerm ? '検索結果がありません' : 'オプションがありません'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    optionStyles,
                    option.disabled ? 'opacity-50 cursor-not-allowed' : '',
                    selectedValues.includes(option.value) ? 'bg-primary-50 text-primary-700' : ''
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-neutral-500">{option.description}</div>
                    )}
                  </div>
                  {selectedValues.includes(option.value) && (
                    <Check size={16} className="text-primary-600" />
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';

export default Select;