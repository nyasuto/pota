'use client';

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { ValidationError } from '../../lib/validation';

interface ValidationMessageProps {
  error?: ValidationError;
  success?: boolean;
  warning?: boolean;
  className?: string;
  showIcon?: boolean;
}

export default function ValidationMessage({
  error,
  success = false,
  warning = false,
  className = '',
  showIcon = true
}: ValidationMessageProps) {
  if (!error && !success && !warning) {
    return null;
  }

  const getStyles = () => {
    if (error) {
      return {
        container: 'text-red-600 bg-red-50 border-red-200',
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      };
    }
    
    if (warning) {
      return {
        container: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />
      };
    }
    
    if (success) {
      return {
        container: 'text-green-600 bg-green-50 border-green-200',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      };
    }

    return {
      container: '',
      icon: null
    };
  };

  const styles = getStyles();
  const message = error?.message || (success ? '入力が正しく検証されました' : '警告があります');

  return (
    <div className={`flex items-center gap-2 p-2 border rounded text-sm ${styles.container} ${className}`}>
      {showIcon && styles.icon}
      <span>{message}</span>
      {error?.code && process.env.NODE_ENV === 'development' && (
        <span className="text-xs opacity-60">({error.code})</span>
      )}
    </div>
  );
}