'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ValidationError } from '../../lib/validation';
import ValidationMessage from './ValidationMessage';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ValidatedSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  error?: ValidationError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  selectClassName?: string;
  description?: string;
}

export default function ValidatedSelect({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = '選択してください',
  error,
  disabled = false,
  required = false,
  className = '',
  selectClassName = '',
  description
}: ValidatedSelectProps) {
  const hasError = !!error;
  
  const baseSelectClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200 appearance-none cursor-pointer
    bg-white
  `;

  const selectClasses = hasError
    ? `${baseSelectClasses} border-red-300 focus:border-red-500 focus:ring-red-500`
    : `${baseSelectClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`${selectClasses} ${selectClassName} pr-10`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${label}-error` : undefined}
        >
          <option value="" disabled>
            {placeholder}
          </option>
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
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {hasError && (
        <div id={`${label}-error`}>
          <ValidationMessage error={error} />
        </div>
      )}
    </div>
  );
}