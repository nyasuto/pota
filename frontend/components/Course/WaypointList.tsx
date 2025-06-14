'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import Card, { CardContent, CardHeader } from '../UI/Card';
import Badge from '../UI/Badge';
import { VStack, HStack } from '../Layout/Stack';
import { MapPin, Navigation, Flag, Camera, Info } from 'lucide-react';

export interface Waypoint {
  id: string;
  title: string;
  description: string;
  position: {
    latitude: number;
    longitude: number;
  };
  type: 'start' | 'end' | 'checkpoint' | 'landmark' | 'rest' | 'photo';
  order?: number;
  estimatedArrivalTime?: number; // seconds from start
  notes?: string;
  imageUrl?: string;
}

export interface WaypointListProps extends React.HTMLAttributes<HTMLDivElement> {
  waypoints: Waypoint[];
  variant?: 'default' | 'compact' | 'timeline';
  showDistance?: boolean;
  showTime?: boolean;
  showImages?: boolean;
  onWaypointClick?: (waypoint: Waypoint) => void;
}

const WaypointList = forwardRef<HTMLDivElement, WaypointListProps>(
  ({
    className,
    waypoints,
    variant = 'default',
    showDistance = true,
    showTime = true,
    showImages = true,
    onWaypointClick,
    ...props
  }, ref) => {
    // Sort waypoints by order if available
    const sortedWaypoints = React.useMemo(() => {
      return [...waypoints].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If no order, sort by type priority
        const typePriority = { start: 0, checkpoint: 1, landmark: 2, rest: 3, photo: 4, end: 5 };
        return typePriority[a.type] - typePriority[b.type];
      });
    }, [waypoints]);

    // Get waypoint icon
    const getWaypointIcon = (type: Waypoint['type']) => {
      const iconMap = {
        start: <Flag className="w-4 h-4" />,
        end: <Flag className="w-4 h-4" />,
        checkpoint: <Navigation className="w-4 h-4" />,
        landmark: <MapPin className="w-4 h-4" />,
        rest: <Info className="w-4 h-4" />,
        photo: <Camera className="w-4 h-4" />,
      };
      return iconMap[type];
    };

    // Get waypoint color
    const getWaypointColor = (type: Waypoint['type']) => {
      const colorMap = {
        start: 'text-success-600 bg-success-100',
        end: 'text-error-600 bg-error-100',
        checkpoint: 'text-primary-600 bg-primary-100',
        landmark: 'text-warning-600 bg-warning-100',
        rest: 'text-secondary-600 bg-secondary-100',
        photo: 'text-neutral-600 bg-neutral-100',
      };
      return colorMap[type];
    };

    // Get waypoint label
    const getWaypointLabel = (type: Waypoint['type']) => {
      const labelMap = {
        start: 'スタート',
        end: 'ゴール',
        checkpoint: 'チェックポイント',
        landmark: 'ランドマーク',
        rest: '休憩地点',
        photo: '撮影スポット',
      };
      return labelMap[type];
    };

    // Format time from seconds
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
      }
      return `${minutes}分`;
    };

    // Calculate distance between two points (simple approximation)
    const calculateDistance = (point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }) => {
      const R = 6371; // Earth's radius in km
      const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
      const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in km
    };

    // Render compact variant
    const renderCompact = () => (
      <VStack spacing="xs" className={className}>
        {sortedWaypoints.map((waypoint, index) => (
          <div
            key={waypoint.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-white',
              'hover:shadow-sm transition-shadow cursor-pointer'
            )}
            onClick={() => onWaypointClick?.(waypoint)}
          >
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full',
              getWaypointColor(waypoint.type)
            )}>
              {getWaypointIcon(waypoint.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-neutral-900 truncate">
                  {waypoint.title}
                </h4>
                <Badge variant="neutral" size="sm">
                  {getWaypointLabel(waypoint.type)}
                </Badge>
              </div>
              <p className="text-xs text-neutral-600 truncate">
                {waypoint.description}
              </p>
            </div>

            {showTime && waypoint.estimatedArrivalTime && (
              <div className="text-xs text-neutral-500">
                {formatTime(waypoint.estimatedArrivalTime)}
              </div>
            )}
          </div>
        ))}
      </VStack>
    );

    // Render timeline variant
    const renderTimeline = () => (
      <div className={cn('relative', className)}>
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />
        
        <VStack spacing="md">
          {sortedWaypoints.map((waypoint, index) => {
            const prevWaypoint = index > 0 ? sortedWaypoints[index - 1] : null;
            const distance = prevWaypoint && showDistance
              ? calculateDistance(prevWaypoint.position, waypoint.position)
              : null;

            return (
              <div key={waypoint.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className={cn(
                  'absolute left-0 top-2 w-8 h-8 rounded-full border-2 border-white shadow-sm',
                  'flex items-center justify-center',
                  getWaypointColor(waypoint.type)
                )}>
                  {getWaypointIcon(waypoint.type)}
                </div>

                {/* Distance indicator */}
                {distance && distance > 0 && (
                  <div className="absolute left-10 -top-6 text-xs text-neutral-500 bg-white px-2 py-1 rounded border">
                    {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                  </div>
                )}

                {/* Content */}
                <Card
                  padding="sm"
                  interactive={!!onWaypointClick}
                  onClick={() => onWaypointClick?.(waypoint)}
                  className="ml-2"
                >
                  <CardContent>
                    <VStack spacing="sm">
                      <HStack justify="between" align="start">
                        <VStack spacing="xs" className="flex-1">
                          <HStack spacing="sm" align="center">
                            <h4 className="font-medium text-neutral-900">
                              {waypoint.title}
                            </h4>
                            <Badge variant="neutral" size="sm">
                              {getWaypointLabel(waypoint.type)}
                            </Badge>
                          </HStack>
                          <p className="text-sm text-neutral-600">
                            {waypoint.description}
                          </p>
                        </VStack>

                        {showTime && waypoint.estimatedArrivalTime && (
                          <Badge variant="outline" size="sm">
                            {formatTime(waypoint.estimatedArrivalTime)}
                          </Badge>
                        )}
                      </HStack>

                      {waypoint.notes && (
                        <p className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
                          {waypoint.notes}
                        </p>
                      )}

                      <div className="text-xs text-neutral-400">
                        {waypoint.position.latitude.toFixed(6)}, {waypoint.position.longitude.toFixed(6)}
                      </div>
                    </VStack>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </VStack>
      </div>
    );

    // Render default variant
    const renderDefault = () => (
      <VStack spacing="md" className={className}>
        {sortedWaypoints.map((waypoint, index) => (
          <Card
            key={waypoint.id}
            interactive={!!onWaypointClick}
            onClick={() => onWaypointClick?.(waypoint)}
            padding="md"
          >
            {showImages && waypoint.imageUrl && (
              <div className="h-32 bg-neutral-200 rounded-lg mb-4 overflow-hidden">
                <img
                  src={waypoint.imageUrl}
                  alt={waypoint.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardContent>
              <VStack spacing="sm">
                <HStack justify="between" align="start">
                  <HStack spacing="sm" align="center">
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full',
                      getWaypointColor(waypoint.type)
                    )}>
                      {getWaypointIcon(waypoint.type)}
                    </div>
                    
                    <VStack spacing="xs">
                      <h3 className="font-semibold text-lg text-neutral-900">
                        {waypoint.title}
                      </h3>
                      <Badge variant="neutral" size="sm">
                        {getWaypointLabel(waypoint.type)}
                      </Badge>
                    </VStack>
                  </HStack>

                  {showTime && waypoint.estimatedArrivalTime && (
                    <Badge variant="outline">
                      {formatTime(waypoint.estimatedArrivalTime)}
                    </Badge>
                  )}
                </HStack>

                <p className="text-neutral-600">
                  {waypoint.description}
                </p>

                {waypoint.notes && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      <strong>メモ:</strong> {waypoint.notes}
                    </p>
                  </div>
                )}

                <HStack spacing="sm" className="text-xs text-neutral-500">
                  <HStack spacing="xs">
                    <MapPin size={12} />
                    <span>
                      {waypoint.position.latitude.toFixed(6)}, {waypoint.position.longitude.toFixed(6)}
                    </span>
                  </HStack>
                  
                  {waypoint.order !== undefined && (
                    <span>• 地点 {waypoint.order + 1}</span>
                  )}
                </HStack>
              </VStack>
            </CardContent>
          </Card>
        ))}
      </VStack>
    );

    return (
      <div ref={ref} {...props}>
        {variant === 'compact' && renderCompact()}
        {variant === 'timeline' && renderTimeline()}
        {variant === 'default' && renderDefault()}
      </div>
    );
  }
);

WaypointList.displayName = 'WaypointList';

export default WaypointList;