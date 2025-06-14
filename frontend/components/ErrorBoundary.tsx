'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'section' | 'component';
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: this.generateErrorId(),
    });

    // Log error details
    console.error('[ErrorBoundary] エラーをキャッチしました:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // This could be integrated with error monitoring services like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      level: this.props.level || 'component',
    };

    // Store in session storage for debugging
    if (typeof window !== 'undefined') {
      try {
        const existingErrors = JSON.parse(sessionStorage.getItem('errorReports') || '[]');
        existingErrors.push(errorReport);
        // Keep only last 10 errors
        const recentErrors = existingErrors.slice(-10);
        sessionStorage.setItem('errorReports', JSON.stringify(recentErrors));
      } catch (e) {
        console.warn('Failed to store error report:', e);
      }
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
    });
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private getErrorLevel() {
    return this.props.level || 'component';
  }

  private renderErrorUI() {
    const { showDetails = false } = this.props;
    const { error, errorId } = this.state;
    const level = this.getErrorLevel();

    const containerClasses = {
      page: 'min-h-screen flex items-center justify-center bg-gray-50 px-4',
      section: 'py-12 px-4 bg-gray-50 rounded-lg',
      component: 'p-6 bg-red-50 border border-red-200 rounded-lg',
    };

    const iconSizes = {
      page: 'h-16 w-16',
      section: 'h-12 w-12',
      component: 'h-8 w-8',
    };

    const titleSizes = {
      page: 'text-2xl',
      section: 'text-xl',
      component: 'text-lg',
    };

    return (
      <div className={containerClasses[level]}>
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <AlertTriangle className={`${iconSizes[level]} text-red-500`} />
          </div>
          
          <h2 className={`${titleSizes[level]} font-semibold text-gray-900 mb-2`}>
            {level === 'page' ? 'ページの読み込みでエラーが発生しました' :
             level === 'section' ? 'セクションの表示でエラーが発生しました' :
             'コンポーネントでエラーが発生しました'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            申し訳ございません。一時的な問題が発生しています。
            しばらく時間をおいてから再度お試しください。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </button>
            
            {level === 'page' && (
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </button>
            )}
          </div>

          {showDetails && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                エラー詳細を表示 (ID: {errorId})
              </summary>
              <div className="mt-2 p-4 bg-gray-100 rounded text-xs text-gray-700 font-mono">
                <div className="mb-2">
                  <strong>エラーメッセージ:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>スタックトレース:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="mt-4 text-xs text-gray-400">
            エラーID: {errorId}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for error reporting from functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: string) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      info: errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    console.error('[useErrorHandler] エラーを報告:', errorReport);

    // Store in session storage
    if (typeof window !== 'undefined') {
      try {
        const existingErrors = JSON.parse(sessionStorage.getItem('errorReports') || '[]');
        existingErrors.push(errorReport);
        const recentErrors = existingErrors.slice(-10);
        sessionStorage.setItem('errorReports', JSON.stringify(recentErrors));
      } catch (e) {
        console.warn('Failed to store error report:', e);
      }
    }
  }, []);
}

export default ErrorBoundary;