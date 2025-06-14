'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  checkGeolocationPermission,
  isGeolocationSupported,
  wasLocationPermissionAsked,
  markLocationPermissionAsked,
  GeolocationError,
  GeolocationPosition,
} from '../../lib/geolocation';

interface LocationPermissionContextType {
  permissionState: PermissionState | null;
  isSupported: boolean;
  hasAskedPermission: boolean;
  requestPermission: () => Promise<PermissionState | null>;
  showPermissionDialog: boolean;
  setShowPermissionDialog: (show: boolean) => void;
  lastError: GeolocationError | null;
  setLastError: (error: GeolocationError | null) => void;
}

const LocationPermissionContext = createContext<LocationPermissionContextType | undefined>(undefined);

interface LocationPermissionProviderProps {
  children: ReactNode;
}

export function LocationPermissionProvider({ children }: LocationPermissionProviderProps) {
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [isSupported] = useState(isGeolocationSupported());
  const [hasAskedPermission, setHasAskedPermission] = useState(wasLocationPermissionAsked());
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [lastError, setLastError] = useState<GeolocationError | null>(null);

  const requestPermission = async (): Promise<PermissionState | null> => {
    if (!isSupported) return null;

    try {
      const permission = await checkGeolocationPermission();
      setPermissionState(permission);
      markLocationPermissionAsked();
      setHasAskedPermission(true);
      return permission;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check initial permission state
    if (isSupported) {
      checkGeolocationPermission().then(setPermissionState);
    }
  }, [isSupported]);

  return (
    <LocationPermissionContext.Provider
      value={{
        permissionState,
        isSupported,
        hasAskedPermission,
        requestPermission,
        showPermissionDialog,
        setShowPermissionDialog,
        lastError,
        setLastError,
      }}
    >
      {children}
    </LocationPermissionContext.Provider>
  );
}

export function useLocationPermission() {
  const context = useContext(LocationPermissionContext);
  if (context === undefined) {
    throw new Error('useLocationPermission must be used within a LocationPermissionProvider');
  }
  return context;
}

// Permission dialog component
export function LocationPermissionDialog() {
  const {
    showPermissionDialog,
    setShowPermissionDialog,
    permissionState,
    isSupported,
    requestPermission,
  } = useLocationPermission();

  if (!showPermissionDialog || permissionState === 'granted' || !isSupported) {
    return null;
  }

  const handleAllow = async () => {
    await requestPermission();
    setShowPermissionDialog(false);
  };

  const handleDeny = () => {
    setShowPermissionDialog(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">位置情報の使用許可</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            ポタりんが位置情報を使用することを許可しますか？
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-medium text-blue-900 mb-2">位置情報を使用する理由：</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• あなたの近くのおすすめコースを提案</li>
              <li>• より正確で関連性の高いルート検索</li>
              <li>• 現在地からの距離と時間を計算</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">プライバシーについて：</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 位置情報はサーバーに保存されません</li>
            <li>• 第三者と共有することはありません</li>
            <li>• いつでも設定から無効にできます</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDeny}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            許可しない
          </button>
          <button
            onClick={handleAllow}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            許可する
          </button>
        </div>
      </div>
    </div>
  );
}