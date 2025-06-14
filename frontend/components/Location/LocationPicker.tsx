'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GeocodingResult, reverseGeocode, formatAddress } from '../../lib/geocoding';
import { GeolocationPosition } from '../../lib/geolocation';

// Dynamically import map component to avoid SSR issues
const DynamicLocationMap = dynamic(() => Promise.resolve(LocationMap), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center h-64">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-600 text-sm">地図を読み込み中...</p>
      </div>
    </div>
  )
});

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  className?: string;
  height?: string;
  zoom?: number;
  showAddressPreview?: boolean;
}

interface LocationMapProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  height: string;
  zoom: number;
  showAddressPreview: boolean;
}

function LocationMap({ 
  onLocationSelect, 
  initialLocation, 
  height, 
  zoom, 
  showAddressPreview 
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState<string>('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Fix Leaflet default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Clear any existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const defaultLocation = initialLocation || { latitude: 35.6762, longitude: 139.6503 };

        if (!mapRef.current) {
          throw new Error('Map container ref is null');
        }

        const map = L.map(mapRef.current).setView(
          [defaultLocation.latitude, defaultLocation.longitude],
          zoom
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Create custom marker icon
        const customIcon = L.divIcon({
          html: `
            <div style="
              background-color: #ef4444;
              width: 20px;
              height: 20px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid white;
              transform: rotate(-45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                width: 6px;
                height: 6px;
                background-color: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          className: 'location-picker-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 20],
        });

        // Add initial marker
        if (initialLocation) {
          markerRef.current = L.marker([initialLocation.latitude, initialLocation.longitude], {
            icon: customIcon,
            draggable: true
          }).addTo(map);

          // Handle marker drag
          markerRef.current.on('dragend', async (e: any) => {
            const position = e.target.getLatLng();
            await handleLocationChange(position.lat, position.lng);
          });
        }

        // Handle map click
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng;

          // Remove existing marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // Add new marker
          markerRef.current = L.marker([lat, lng], {
            icon: customIcon,
            draggable: true
          }).addTo(map);

          // Handle marker drag
          markerRef.current.on('dragend', async (dragEvent: any) => {
            const position = dragEvent.target.getLatLng();
            await handleLocationChange(position.lat, position.lng);
          });

          await handleLocationChange(lat, lng);
        });

        mapInstanceRef.current = map;

        // Get initial address if location is provided
        if (initialLocation && showAddressPreview) {
          await getAddressForLocation(initialLocation.latitude, initialLocation.longitude);
        }

      } catch (error) {
        console.error('Failed to initialize location picker map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation, zoom, showAddressPreview]);

  const handleLocationChange = async (latitude: number, longitude: number) => {
    setSelectedLocation({ latitude, longitude });
    
    let locationWithAddress = { latitude, longitude, address: undefined as string | undefined };

    if (showAddressPreview) {
      const addressResult = await getAddressForLocation(latitude, longitude);
      if (addressResult) {
        locationWithAddress.address = addressResult;
      }
    }

    onLocationSelect(locationWithAddress);
  };

  const getAddressForLocation = async (latitude: number, longitude: number): Promise<string | null> => {
    if (!showAddressPreview) return null;

    setIsLoadingAddress(true);
    try {
      const result = await reverseGeocode(latitude, longitude);
      if (result) {
        const formattedAddress = formatAddress(result.address);
        setAddress(formattedAddress || result.displayName);
        return formattedAddress || result.displayName;
      }
    } catch (error) {
      console.error('Failed to get address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-gray-300 overflow-hidden"
        style={{ height }}
      />

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-blue-800">地図上をクリックして位置を選択</p>
            <p className="text-blue-700">マーカーをドラッグして微調整することもできます</p>
          </div>
        </div>
      </div>

      {/* Address Preview */}
      {showAddressPreview && selectedLocation && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-grow">
              <p className="text-sm font-medium text-gray-800">選択された位置</p>
              {isLoadingAddress ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                  <span className="text-xs text-gray-600">住所を取得中...</span>
                </div>
              ) : address ? (
                <p className="text-sm text-gray-600 mt-1">{address}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">住所の取得に失敗しました</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                緯度: {selectedLocation.latitude.toFixed(6)}, 
                経度: {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  className = '',
  height = '300px',
  zoom = 15,
  showAddressPreview = true,
}: LocationPickerProps) {
  return (
    <div className={className}>
      <DynamicLocationMap
        onLocationSelect={onLocationSelect}
        initialLocation={initialLocation}
        height={height}
        zoom={zoom}
        showAddressPreview={showAddressPreview}
      />
    </div>
  );
}