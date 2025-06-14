'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { formatDuration, formatDistance } from '../../lib/utils';
import Card, { CardContent, CardFooter } from '../UI/Card';
import Badge, { DifficultyBadge, CourseTypeBadge } from '../UI/Badge';
import { HStack, VStack } from '../Layout/Stack';
import { MapPin, Clock, Route, Heart, Share2 } from 'lucide-react';
import IconButton from '../UI/IconButton';

export interface CourseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  course: {
    id: string;
    title: string;
    description: string;
    distance: number; // in meters
    estimatedTime: number; // in seconds
    difficulty: 'easy' | 'moderate' | 'hard';
    courseType: 'walking' | 'cycling' | 'jogging';
    startPoint: {
      latitude: number;
      longitude: number;
    };
    highlights?: string[];
    summary?: string;
    tags?: string[];
    rating?: number;
    reviewCount?: number;
    imageUrl?: string;
  };
  variant?: 'default' | 'compact' | 'detailed';
  interactive?: boolean;
  showActions?: boolean;
  favorited?: boolean;
  onFavoriteClick?: (courseId: string, favorited: boolean) => void;
  onShareClick?: (courseId: string) => void;
  onCardClick?: (courseId: string) => void;
}

const CourseCard = forwardRef<HTMLDivElement, CourseCardProps>(
  ({
    className,
    course,
    variant = 'default',
    interactive = true,
    showActions = true,
    favorited = false,
    onFavoriteClick,
    onShareClick,
    onCardClick,
    ...props
  }, ref) => {
    const handleCardClick = () => {
      if (interactive && onCardClick) {
        onCardClick(course.id);
      }
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onFavoriteClick?.(course.id, !favorited);
    };

    const handleShareClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onShareClick?.(course.id);
    };

    // Render different variants
    const renderCompact = () => (
      <Card
        ref={ref}
        className={cn('w-full max-w-md', className)}
        interactive={interactive}
        onClick={handleCardClick}
        padding="sm"
        {...props}
      >
        <CardContent>
          <VStack spacing="sm">
            {/* Header */}
            <HStack justify="between" align="start">
              <VStack spacing="xs" className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-neutral-900 truncate">
                  {course.title}
                </h3>
                <CourseTypeBadge courseType={course.courseType} size="sm" />
              </VStack>
              
              {showActions && (
                <HStack spacing="xs">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Heart className={favorited ? 'fill-current text-error-500' : ''} />}
                    onClick={handleFavoriteClick}
                    label={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
                  />
                </HStack>
              )}
            </HStack>

            {/* Stats */}
            <HStack spacing="sm" className="text-sm text-neutral-600">
              <HStack spacing="xs">
                <Route size={14} />
                <span>{formatDistance(course.distance)}</span>
              </HStack>
              
              <HStack spacing="xs">
                <Clock size={14} />
                <span>{formatDuration(course.estimatedTime)}</span>
              </HStack>
              
              <DifficultyBadge difficulty={course.difficulty} size="sm" />
            </HStack>
          </VStack>
        </CardContent>
      </Card>
    );

    const renderDefault = () => (
      <Card
        ref={ref}
        className={cn('w-full max-w-sm', className)}
        interactive={interactive}
        onClick={handleCardClick}
        {...props}
      >
        {/* Image */}
        {course.imageUrl && (
          <div className="relative h-40 bg-neutral-200 rounded-t-lg overflow-hidden">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {showActions && (
              <div className="absolute top-2 right-2">
                <HStack spacing="xs">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Heart className={favorited ? 'fill-current text-error-500' : 'text-white'} />}
                    onClick={handleFavoriteClick}
                    className="bg-black/20 backdrop-blur-sm hover:bg-black/30"
                    label={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Share2 className="text-white" />}
                    onClick={handleShareClick}
                    className="bg-black/20 backdrop-blur-sm hover:bg-black/30"
                    label="共有"
                  />
                </HStack>
              </div>
            )}
          </div>
        )}

        <CardContent>
          <VStack spacing="md">
            {/* Header */}
            <VStack spacing="sm">
              <HStack justify="between" align="start">
                <h3 className="font-semibold text-lg text-neutral-900">
                  {course.title}
                </h3>
                <CourseTypeBadge courseType={course.courseType} />
              </HStack>
              
              <p className="text-sm text-neutral-600 line-clamp-2">
                {course.description}
              </p>
            </VStack>

            {/* Stats */}
            <HStack spacing="md" className="text-sm">
              <HStack spacing="xs" className="text-neutral-600">
                <Route size={16} />
                <span>{formatDistance(course.distance)}</span>
              </HStack>
              
              <HStack spacing="xs" className="text-neutral-600">
                <Clock size={16} />
                <span>{formatDuration(course.estimatedTime)}</span>
              </HStack>
              
              <DifficultyBadge difficulty={course.difficulty} />
            </HStack>

            {/* Location */}
            {course.startPoint && (
              <HStack spacing="xs" className="text-xs text-neutral-500">
                <MapPin size={12} />
                <span>
                  開始地点: {course.startPoint.latitude.toFixed(4)}, {course.startPoint.longitude.toFixed(4)}
                </span>
              </HStack>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <HStack spacing="xs" wrap>
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="neutral" size="sm">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="neutral" size="sm">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>
        </CardContent>

        {!course.imageUrl && showActions && (
          <CardFooter>
            <HStack justify="end" spacing="xs">
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Heart className={favorited ? 'fill-current text-error-500' : ''} />}
                onClick={handleFavoriteClick}
                label={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
              />
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Share2 />}
                onClick={handleShareClick}
                label="共有"
              />
            </HStack>
          </CardFooter>
        )}
      </Card>
    );

    const renderDetailed = () => (
      <Card
        ref={ref}
        className={cn('w-full', className)}
        interactive={interactive}
        onClick={handleCardClick}
        {...props}
      >
        <CardContent>
          <VStack spacing="lg">
            {/* Header */}
            <HStack justify="between" align="start">
              <VStack spacing="sm" className="flex-1">
                <HStack spacing="md" align="center">
                  <h3 className="font-bold text-xl text-neutral-900">
                    {course.title}
                  </h3>
                  <CourseTypeBadge courseType={course.courseType} />
                  <DifficultyBadge difficulty={course.difficulty} />
                </HStack>
                
                <p className="text-neutral-600">
                  {course.description}
                </p>
              </VStack>
              
              {showActions && (
                <HStack spacing="xs">
                  <IconButton
                    variant="ghost"
                    size="md"
                    icon={<Heart className={favorited ? 'fill-current text-error-500' : ''} />}
                    onClick={handleFavoriteClick}
                    label={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
                  />
                  <IconButton
                    variant="ghost"
                    size="md"
                    icon={<Share2 />}
                    onClick={handleShareClick}
                    label="共有"
                  />
                </HStack>
              )}
            </HStack>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <Route className="w-6 h-6 mx-auto mb-1 text-primary-500" />
                <div className="font-semibold text-neutral-900">
                  {formatDistance(course.distance)}
                </div>
                <div className="text-xs text-neutral-500">距離</div>
              </div>
              
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-1 text-secondary-500" />
                <div className="font-semibold text-neutral-900">
                  {formatDuration(course.estimatedTime)}
                </div>
                <div className="text-xs text-neutral-500">時間</div>
              </div>
              
              {course.rating && (
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="font-semibold text-neutral-900">
                    ⭐ {course.rating.toFixed(1)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {course.reviewCount ? `${course.reviewCount}件のレビュー` : '評価'}
                  </div>
                </div>
              )}
              
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <MapPin className="w-6 h-6 mx-auto mb-1 text-success-500" />
                <div className="text-xs font-medium text-neutral-900">
                  {course.startPoint.latitude.toFixed(4)}
                </div>
                <div className="text-xs text-neutral-500">開始地点</div>
              </div>
            </div>

            {/* Highlights */}
            {course.highlights && course.highlights.length > 0 && (
              <VStack spacing="sm">
                <h4 className="font-medium text-neutral-900">見どころ</h4>
                <ul className="space-y-1">
                  {course.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-primary-500 mt-1.5">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </VStack>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <VStack spacing="sm">
                <h4 className="font-medium text-neutral-900">タグ</h4>
                <HStack spacing="xs" wrap>
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="neutral" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            )}
          </VStack>
        </CardContent>
      </Card>
    );

    // Render based on variant
    switch (variant) {
      case 'compact':
        return renderCompact();
      case 'detailed':
        return renderDetailed();
      default:
        return renderDefault();
    }
  }
);

CourseCard.displayName = 'CourseCard';

export default CourseCard;