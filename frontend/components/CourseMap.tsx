'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Waypoint } from '../../shared/types';
import ComponentErrorBoundary from './ComponentErrorBoundary';
import { useErrorHandler } from './ErrorBoundary';

interface CourseMapProps {
  waypoints: Waypoint[];
  className?: string;
}

// Create a dynamic component that only renders on client
const DynamicMap = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-600 text-sm">地図を読み込み中...</p>
      </div>
    </div>
  )
});

const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'start':
      return '#22c55e'; // green
    case 'end':
      return '#ef4444'; // red
    case 'checkpoint':
      return '#3b82f6'; // blue
    case 'landmark':
      return '#f59e0b'; // amber
    default:
      return '#6b7280'; // gray
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'start':
      return 'スタート地点';
    case 'end':
      return 'ゴール地点';
    case 'checkpoint':
      return 'チェックポイント';
    case 'landmark':
      return 'ランドマーク';
    default:
      return 'ポイント';
  }
};

function MapComponent({ waypoints, className = '' }: CourseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const reportError = useErrorHandler();

  useEffect(() => {
    // Capture ref value at the start of the effect
    const containerElement = mapRef.current;
    
    if (!containerElement || waypoints.length === 0 || isInitializingRef.current) {
      return;
    }

    const initializeMap = async () => {
      // Prevent multiple initialization attempts
      if (isInitializingRef.current) {
        return;
      }
      
      isInitializingRef.current = true;

      try {
        // Clean up any existing map instance first
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Clear the container completely
        if (containerElement) {
          containerElement.innerHTML = '';
          // Remove any Leaflet-specific attributes or classes
          (containerElement as any)._leaflet_id = undefined;
          containerElement.removeAttribute('data-leaflet-id');
        }

        // Dynamic import Leaflet only on client side
        const L = (await import('leaflet')).default;

        // Fix Leaflet default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Calculate center
        const lats = waypoints.map(w => w.position.latitude);
        const lngs = waypoints.map(w => w.position.longitude);
        const center: [number, number] = [
          lats.reduce((sum, lat) => sum + lat, 0) / lats.length,
          lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length
        ];

        // Create map with additional safeguards
        if (!containerElement) {
          throw new Error('Map container ref is null');
        }

        const map = L.map(containerElement, {
          center: center,
          zoom: 14,
          zoomControl: false
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add zoom control
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Create custom icon function
        const createCustomIcon = (type: string, color: string) => {
          return L.divIcon({
            html: `
              <div style="
                background-color: ${color};
                width: 25px;
                height: 25px;
                border-radius: 50% 50% 50% 0;
                border: 3px solid white;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                <span style="
                  color: white;
                  font-weight: bold;
                  font-size: 12px;
                  transform: rotate(45deg);
                ">
                  ${type === 'start' ? 'S' : type === 'end' ? 'E' : type === 'checkpoint' ? 'C' : 'L'}
                </span>
              </div>
            `,
            className: 'custom-marker',
            iconSize: [25, 25],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
          });
        };

        // Add markers and create path
        const pathCoords: [number, number][] = [];
        const markers: any[] = [];

        waypoints.forEach((waypoint, index) => {
          const coords: [number, number] = [waypoint.position.latitude, waypoint.position.longitude];
          pathCoords.push(coords);

          const marker = L.marker(coords, {
            icon: createCustomIcon(waypoint.type, getMarkerColor(waypoint.type))
          }).addTo(map);

          marker.bindPopup(`
            <div style="min-width: 200px;">
              <div style="margin-bottom: 8px;">
                <span style="
                  background-color: #dbeafe;
                  color: #1e40af;
                  padding: 4px 8px;
                  border-radius: 9999px;
                  font-size: 12px;
                  font-weight: 600;
                ">
                  ${getTypeLabel(waypoint.type)}
                </span>
                <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">
                  #${index + 1}
                </span>
              </div>
              <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 4px;">
                ${waypoint.title}
              </h3>
              <p style="color: #4b5563; font-size: 14px; margin-bottom: 8px;">
                ${waypoint.description}
              </p>
              <div style="color: #6b7280; font-size: 12px;">
                座標: ${waypoint.position.latitude.toFixed(6)}, ${waypoint.position.longitude.toFixed(6)}
              </div>
            </div>
          `);

          markers.push(marker);
        });

        // Add route polyline
        if (pathCoords.length > 1) {
          L.polyline(pathCoords, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7
          }).addTo(map);
        }

        // Fit map to show all markers
        if (pathCoords.length > 0) {
          const group = new L.FeatureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.1));
        }

        mapInstanceRef.current = map;
        setIsLoaded(true);

      } catch (error) {
        console.error('Failed to initialize map:', error);
        reportError(error as Error, 'Map initialization failed');
        setIsLoaded(false);
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      isInitializingRef.current = false;
      
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }

      // Clean up the container using captured ref value
      if (containerElement) {
        containerElement.innerHTML = '';
        (containerElement as any)._leaflet_id = undefined;
        containerElement.removeAttribute('data-leaflet-id');
      }
      
      setIsLoaded(false);
    };
  }, [waypoints, reportError]);

  if (waypoints.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-600">地図データがありません</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600 text-sm">地図を読み込み中...</p>
          </div>
        </div>
      )}

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-600 shadow-sm">
          ポイント数: {waypoints.length}
        </div>
      </div>

      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}

export default function CourseMap({ waypoints, className = '' }: CourseMapProps) {
  return (
    <ComponentErrorBoundary 
      componentName="地図コンポーネント"
      level="section"
    >
      <DynamicMap waypoints={waypoints} className={className} />
    </ComponentErrorBoundary>
  );
}