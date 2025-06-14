'use client';

import React from 'react';
import { ValidationError } from '../../lib/validation';
import ValidationMessage from './ValidationMessage';

interface ValidatedInputProps {
  label: string;
  type?: 'text' | 'email' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: ValidationError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  description?: string;
}

export default function ValidatedInput({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  description
}: ValidatedInputProps) {
  const hasError = !!error;
  
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const inputClasses = hasError
    ? `${baseInputClasses} border-red-300 focus:border-red-500 focus:ring-red-500`
    : `${baseInputClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${inputClasses} ${inputClassName}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${label}-error` : undefined}
      />
      
      {hasError && (
        <div id={`${label}-error`}>
          <ValidationMessage error={error} />
        </div>
      )}
    </div>
  );
}