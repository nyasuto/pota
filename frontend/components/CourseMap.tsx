'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { Waypoint } from '../../shared/types';

interface CourseMapProps {
  waypoints: Waypoint[];
  className?: string;
}

// Custom marker icons
const createCustomIcon = (type: string, color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        <text x="12.5" y="17" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">
          ${type === 'start' ? 'S' : type === 'end' ? 'E' : type === 'checkpoint' ? 'C' : 'L'}
        </text>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

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

export default function CourseMap({ waypoints, className = '' }: CourseMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || waypoints.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-600">地図を読み込み中...</p>
      </div>
    );
  }

  // Calculate map center and bounds
  const positions: LatLngTuple[] = waypoints.map(wp => [wp.position.latitude, wp.position.longitude]);
  const center: LatLngTuple = [
    positions.reduce((sum, pos) => sum + pos[0], 0) / positions.length,
    positions.reduce((sum, pos) => sum + pos[1], 0) / positions.length,
  ];

  const handleFitToBounds = () => {
    // This would be implemented with a ref to the map instance
    // For now, we'll add the UI elements
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleFitToBounds}
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors"
          title="ルート全体を表示"
        >
          🗺️ 全体表示
        </button>
        <div className="bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-600 shadow-sm">
          ポイント数: {waypoints.length}
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg z-0"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route line */}
        <Polyline
          positions={positions}
          color="#3b82f6"
          weight={4}
          opacity={0.7}
        />
        
        {/* Waypoint markers */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={waypoint.id}
            position={[waypoint.position.latitude, waypoint.position.longitude]}
            icon={createCustomIcon(waypoint.type, getMarkerColor(waypoint.type))}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {getTypeLabel(waypoint.type)}
                  </span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{waypoint.title}</h3>
                <p className="text-sm text-gray-600">{waypoint.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  座標: {waypoint.position.latitude.toFixed(6)}, {waypoint.position.longitude.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}