'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ValidationError } from '../../lib/validation';

interface FormErrorSummaryProps {
  errors: ValidationError[];
  title?: string;
  onDismiss?: () => void;
  className?: string;
  maxErrors?: number;
}

export default function FormErrorSummary({
  errors,
  title = 'フォームにエラーがあります',
  onDismiss,
  className = '',
  maxErrors = 5
}: FormErrorSummaryProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  const displayErrors = errors.slice(0, maxErrors);
  const hasMoreErrors = errors.length > maxErrors;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {title}
          </h3>
          
          <div className="mt-2">
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {displayErrors.map((error, index) => (
                <li key={`${error.field}-${error.code}-${index}`}>
                  <span className="font-medium">{error.field}:</span> {error.message}
                </li>
              ))}
              {hasMoreErrors && (
                <li className="text-red-600 font-medium">
                  ...他に{errors.length - maxErrors}件のエラーがあります
                </li>
              )}
            </ul>
          </div>
          
          {errors.length > 0 && (
            <div className="mt-3 text-xs text-red-600">
              上記のエラーを修正してから再度お試しください。
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600"
            >
              <span className="sr-only">エラーを閉じる</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}