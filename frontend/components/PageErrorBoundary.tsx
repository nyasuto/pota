'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

function PageErrorFallback() {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ページの読み込みでエラーが発生しました
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          申し訳ございません。ポタりんアプリで一時的な問題が発生しています。
          <br />
          しばらく時間をおいてから再度お試しください。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            ページを再読み込み
          </button>
          
          <button
            onClick={handleGoHome}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg font-medium"
          >
            <Home className="h-5 w-5 mr-2" />
            ホームに戻る
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">問題が続く場合</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• ブラウザのキャッシュをクリアしてください</li>
            <li>• インターネット接続を確認してください</li>
            <li>• しばらく時間をおいてから再度アクセスしてください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PageErrorBoundary({ children, onError }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      fallback={<PageErrorFallback />}
      onError={onError}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}