'use client';

import { useState, useCallback } from 'react';
import { 
  getCurrentPosition, 
  GeolocationPosition, 
  GeolocationError,
  getAccuracyLevel,
  DEFAULT_LOCATION,
  markLocationPermissionAsked
} from '../../lib/geolocation';

interface CurrentLocationButtonProps {
  onLocationFound: (position: GeolocationPosition) => void;
  onLocationError?: (error: GeolocationError) => void;
  className?: string;
  disabled?: boolean;
  showAccuracy?: boolean;
}

export default function CurrentLocationButton({
  onLocationFound,
  onLocationError,
  className = '',
  disabled = false,
  showAccuracy = true,
}: CurrentLocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);

  const handleGetLocation = useCallback(async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      markLocationPermissionAsked();
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes cache
      });

      setLastPosition(position);
      onLocationFound(position);
    } catch (err) {
      const error = err as GeolocationError;
      setError(error);
      
      // For certain errors, fall back to default location
      if (error.type === 'PERMISSION_DENIED' || error.type === 'NOT_SUPPORTED') {
        console.info('Using default location as fallback');
        onLocationFound(DEFAULT_LOCATION);
      }
      
      onLocationError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [disabled, isLoading, onLocationFound, onLocationError]);

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>位置情報を取得中...</span>
        </div>
      );
    }

    if (error) {
      switch (error.type) {
        case 'PERMISSION_DENIED':
          return <span>位置情報が無効</span>;
        case 'TIMEOUT':
          return <span>タイムアウト - 再試行</span>;
        default:
          return <span>位置情報の取得に失敗</span>;
      }
    }

    return <span>現在地を使用</span>;
  };

  const getButtonStyle = () => {
    const baseStyle = `
      px-4 py-2 rounded-lg font-medium transition-all duration-200 
      flex items-center justify-center min-w-[140px]
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    if (error) {
      switch (error.type) {
        case 'PERMISSION_DENIED':
          return `${baseStyle} bg-yellow-500 hover:bg-yellow-600 text-white`;
        case 'TIMEOUT':
        case 'POSITION_UNAVAILABLE':
          return `${baseStyle} bg-orange-500 hover:bg-orange-600 text-white`;
        default:
          return `${baseStyle} bg-red-500 hover:bg-red-600 text-white`;
      }
    }

    if (lastPosition) {
      return `${baseStyle} bg-green-500 hover:bg-green-600 text-white`;
    }

    return `${baseStyle} bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl`;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleGetLocation}
        disabled={disabled}
        className={getButtonStyle()}
        title={error ? error.message : '現在地から近くのコースを検索'}
      >
        {getButtonContent()}
      </button>

      {/* Accuracy indicator */}
      {showAccuracy && lastPosition && !error && (
        <div className="text-xs text-gray-600 text-center">
          <div className="flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              getAccuracyLevel(lastPosition.accuracy).level === 'high' ? 'bg-green-500' :
              getAccuracyLevel(lastPosition.accuracy).level === 'medium' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <span>{getAccuracyLevel(lastPosition.accuracy).description}</span>
          </div>
        </div>
      )}

      {/* Error details */}
      {error && (
        <div className="text-xs text-gray-600 text-center">
          {error.type === 'PERMISSION_DENIED' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-yellow-800">
                位置情報の使用が許可されていません。<br />
                ブラウザの設定で位置情報を有効にしてください。
              </p>
            </div>
          )}
          {error.type === 'TIMEOUT' && (
            <div className="bg-orange-50 border border-orange-200 rounded p-2">
              <p className="text-orange-800">
                位置情報の取得がタイムアウトしました。<br />
                もう一度お試しください。
              </p>
            </div>
          )}
          {error.type === 'POSITION_UNAVAILABLE' && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <p className="text-red-800">
                位置情報を取得できませんでした。<br />
                デフォルト位置を表示しています。
              </p>
            </div>
          )}
          {error.type === 'NOT_SUPPORTED' && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2">
              <p className="text-gray-800">
                このブラウザは位置情報に対応していません。<br />
                デフォルト位置を表示しています。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}