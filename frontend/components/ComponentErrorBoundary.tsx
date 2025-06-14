'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
  level?: 'section' | 'component';
}

function ComponentErrorFallback({ 
  componentName, 
  onRetry, 
  showRetry = true,
  level = 'component' 
}: {
  componentName?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  level?: 'section' | 'component';
}) {
  const containerClasses = level === 'section' 
    ? 'py-8 px-6 bg-red-50 border border-red-200 rounded-lg'
    : 'p-4 bg-red-50 border border-red-200 rounded-md';

  const iconSize = level === 'section' ? 'h-8 w-8' : 'h-6 w-6';
  const titleSize = level === 'section' ? 'text-lg' : 'text-base';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <AlertCircle className={`${iconSize} text-red-500`} />
        </div>
        
        <h3 className={`${titleSize} font-semibold text-red-900 mb-2`}>
          {componentName ? `${componentName}でエラーが発生しました` : 'コンポーネントエラー'}
        </h3>
        
        <p className="text-red-700 text-sm mb-4">
          このセクションの表示中に問題が発生しました。
        </p>

        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            再試行
          </button>
        )}
      </div>
    </div>
  );
}

export default function ComponentErrorBoundary({ 
  children, 
  componentName,
  onError,
  showRetry = true,
  level = 'component'
}: ComponentErrorBoundaryProps) {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`[ComponentErrorBoundary] ${componentName || 'コンポーネント'}でエラー:`, {
      error: error.message,
      componentName,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      key={retryKey}
      level={level}
      fallback={
        <ComponentErrorFallback 
          componentName={componentName}
          onRetry={showRetry ? handleRetry : undefined}
          showRetry={showRetry}
          level={level}
        />
      }
      onError={handleError}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}