'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface AsyncErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  retryCount: number;
}

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AsyncErrorBoundaryState> {
    const isNetworkError = error.name === 'NetworkError' || 
                          error.message.includes('Failed to fetch') ||
                          error.message.includes('Network Error') ||
                          error.message.includes('ERR_NETWORK');

    return {
      hasError: true,
      error,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AsyncErrorBoundary] 非同期エラーをキャッチ:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isNetworkError: this.state.isNetworkError,
      retryCount: this.state.retryCount,
    });

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  componentDidMount() {
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    console.error('[AsyncErrorBoundary] 未処理のPromise拒否:', error);
    
    this.setState({
      hasError: true,
      error,
      isNetworkError: this.isNetworkError(error),
    });

    // Prevent the default browser behavior
    event.preventDefault();
  };

  private handleOnline = () => {
    if (this.state.hasError && this.state.isNetworkError) {
      console.log('[AsyncErrorBoundary] オンライン復帰、自動リトライを試行');
      this.handleRetry();
    }
  };

  private handleOffline = () => {
    console.log('[AsyncErrorBoundary] オフライン検出');
  };

  private isNetworkError(error: Error): boolean {
    return error.name === 'NetworkError' || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('Network Error') ||
           error.message.includes('ERR_NETWORK') ||
           error.message.includes('Connection') ||
           error.message.includes('Timeout');
  }

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('[AsyncErrorBoundary] 最大リトライ回数に達しました');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      isNetworkError: false,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleAutoRetry = () => {
    if (this.state.isNetworkError && navigator.onLine) {
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff
      
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  };

  private renderErrorUI() {
    const { error, isNetworkError, retryCount } = this.state;
    const maxRetries = this.props.maxRetries || 3;
    const canRetry = retryCount < maxRetries;

    if (!error) return null;

    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {isNetworkError ? (
              navigator.onLine ? (
                <Wifi className="h-12 w-12 text-yellow-500" />
              ) : (
                <WifiOff className="h-12 w-12 text-red-500" />
              )
            ) : (
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            {isNetworkError ? 'ネットワークエラー' : 'データ読み込みエラー'}
          </h3>
          
          <p className="text-yellow-700 mb-4">
            {isNetworkError 
              ? 'インターネット接続に問題があります。接続を確認してください。'
              : 'データの読み込み中にエラーが発生しました。'
            }
          </p>

          {!navigator.onLine && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              現在オフラインです。インターネット接続を確認してください。
            </div>
          )}

          {canRetry ? (
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                再試行 ({retryCount + 1}/{maxRetries + 1})
              </button>
              
              {isNetworkError && (
                <p className="text-xs text-yellow-600">
                  オンライン復帰時に自動的に再試行されます
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-yellow-700">
              最大リトライ回数に達しました。ページを再読み込みしてください。
            </div>
          )}

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-yellow-600 hover:text-yellow-800">
                エラー詳細
              </summary>
              <div className="mt-2 p-3 bg-yellow-100 rounded text-xs text-yellow-800 font-mono">
                {error.message}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError && error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(error, this.handleRetry);
      }
      
      // Auto-retry for network errors
      if (this.state.isNetworkError && navigator.onLine && this.state.retryCount < (this.props.maxRetries || 3)) {
        this.handleAutoRetry();
      }
      
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Hook for handling async errors in functional components
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return throwError;
}

// Higher-order component for wrapping async operations
export function withAsyncErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<AsyncErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: T) {
    return (
      <AsyncErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AsyncErrorBoundary>
    );
  };
}

export default AsyncErrorBoundary;