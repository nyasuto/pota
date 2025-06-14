// Geolocation utilities for browser location services

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
}

export const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

export const TOKYO_DEFAULT_LOCATION: GeolocationPosition = {
  latitude: 35.6762,
  longitude: 139.6503,
  accuracy: 1000,
  timestamp: Date.now(),
};

/**
 * Check if geolocation is supported by the browser
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Check current geolocation permission status
 */
export async function checkGeolocationPermission(): Promise<PermissionState | null> {
  if (!navigator.permissions) {
    return null;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.warn('Failed to check geolocation permission:', error);
    return null;
  }
}

/**
 * Get current position using browser geolocation API
 */
export function getCurrentPosition(
  options: PositionOptions = {}
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: -1,
        message: 'Geolocation is not supported by this browser',
        type: 'NOT_SUPPORTED',
      } as GeolocationError);
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes cache
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let errorType: GeolocationError['type'];
        switch (error.code) {
          case GEOLOCATION_ERRORS.PERMISSION_DENIED:
            errorType = 'PERMISSION_DENIED';
            break;
          case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
            errorType = 'POSITION_UNAVAILABLE';
            break;
          case GEOLOCATION_ERRORS.TIMEOUT:
            errorType = 'TIMEOUT';
            break;
          default:
            errorType = 'POSITION_UNAVAILABLE';
        }

        reject({
          code: error.code,
          message: error.message,
          type: errorType,
        } as GeolocationError);
      },
      defaultOptions
    );
  });
}

/**
 * Watch position changes with callback
 */
export function watchPosition(
  callback: (position: GeolocationPosition) => void,
  errorCallback: (error: GeolocationError) => void,
  options: PositionOptions = {}
): number | null {
  if (!isGeolocationSupported()) {
    errorCallback({
      code: -1,
      message: 'Geolocation is not supported by this browser',
      type: 'NOT_SUPPORTED',
    });
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute cache for watch
    ...options,
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      let errorType: GeolocationError['type'];
      switch (error.code) {
        case GEOLOCATION_ERRORS.PERMISSION_DENIED:
          errorType = 'PERMISSION_DENIED';
          break;
        case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
          errorType = 'POSITION_UNAVAILABLE';
          break;
        case GEOLOCATION_ERRORS.TIMEOUT:
          errorType = 'TIMEOUT';
          break;
        default:
          errorType = 'POSITION_UNAVAILABLE';
      }

      errorCallback({
        code: error.code,
        message: error.message,
        type: errorType,
      });
    },
    defaultOptions
  );
}

/**
 * Clear position watch
 */
export function clearWatch(watchId: number): void {
  if (isGeolocationSupported()) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistance(
  pos1: { latitude: number; longitude: number },
  pos2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(pos2.latitude - pos1.latitude);
  const dLon = toRadians(pos2.longitude - pos1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pos1.latitude)) *
      Math.cos(toRadians(pos2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get accuracy level description
 */
export function getAccuracyLevel(accuracy: number): {
  level: 'high' | 'medium' | 'low';
  description: string;
} {
  if (accuracy <= 10) {
    return { level: 'high', description: '高精度 (10m以内)' };
  } else if (accuracy <= 100) {
    return { level: 'medium', description: '中精度 (100m以内)' };
  } else {
    return { level: 'low', description: '低精度 (100m以上)' };
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  precision: number = 6
): string {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}

/**
 * Local storage keys for location preferences
 */
export const LOCATION_STORAGE_KEYS = {
  PREFERRED_LOCATION: 'potarin_preferred_location',
  LOCATION_PERMISSION_ASKED: 'potarin_location_permission_asked',
  LAST_KNOWN_LOCATION: 'potarin_last_known_location',
} as const;

/**
 * Save preferred location to local storage
 */
export function savePreferredLocation(position: GeolocationPosition): void {
  try {
    localStorage.setItem(
      LOCATION_STORAGE_KEYS.PREFERRED_LOCATION,
      JSON.stringify(position)
    );
  } catch (error) {
    console.warn('Failed to save preferred location:', error);
  }
}

/**
 * Get preferred location from local storage
 */
export function getPreferredLocation(): GeolocationPosition | null {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEYS.PREFERRED_LOCATION);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to get preferred location:', error);
  }
  return null;
}

/**
 * Check if location permission was previously asked
 */
export function wasLocationPermissionAsked(): boolean {
  try {
    return localStorage.getItem(LOCATION_STORAGE_KEYS.LOCATION_PERMISSION_ASKED) === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Mark location permission as asked
 */
export function markLocationPermissionAsked(): void {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEYS.LOCATION_PERMISSION_ASKED, 'true');
  } catch (error) {
    console.warn('Failed to mark location permission as asked:', error);
  }
}