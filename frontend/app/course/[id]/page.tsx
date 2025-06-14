'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCourseDetails } from '../../../hooks/useCourses';
import type { CourseSuggestion } from '../../../../shared/types';

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function CourseDetailPage({ params, searchParams }: CourseDetailPageProps) {
  const router = useRouter();
  const { course, isLoading, error, getDetails, clearError } = useCourseDetails();
  const [suggestion, setSuggestion] = useState<CourseSuggestion | null>(null);

  useEffect(() => {
    // Get suggestion data from search params (passed from suggestions page)
    const loadData = async () => {
      const searchParamsData = await searchParams;
      
      if (searchParamsData.suggestion) {
        try {
          const suggestionData = JSON.parse(decodeURIComponent(searchParamsData.suggestion as string));
          setSuggestion(suggestionData);
          getDetails(suggestionData);
        } catch (error) {
          console.error('Failed to parse suggestion data:', error);
          router.push('/');
        }
      } else {
        // If no suggestion data, redirect to home
        router.push('/');
      }
    };

    loadData();
  }, [searchParams, getDetails, router]);

  const handleBack = () => {
    router.back();
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '初級';
      case 'moderate': return '中級';
      case 'hard': return '上級';
      default: return difficulty;
    }
  };

  const getWaypointTypeLabel = (type: string) => {
    switch (type) {
      case 'start': return 'スタート';
      case 'checkpoint': return 'チェックポイント';
      case 'landmark': return 'ランドマーク';
      case 'end': return 'ゴール';
      default: return type;
    }
  };

  if (!suggestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">コース情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            コース一覧に戻る
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{suggestion.title}</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {getDifficultyLabel(suggestion.difficulty)}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 text-lg">{suggestion.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{suggestion.distance}km</div>
                <div className="text-sm text-gray-500">距離</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{suggestion.estimatedTime}分</div>
                <div className="text-sm text-gray-500">所要時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {suggestion.courseType === 'walking' ? '散歩' : 
                   suggestion.courseType === 'cycling' ? 'サイクリング' : 'ジョギング'}
                </div>
                <div className="text-sm text-gray-500">コースタイプ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{suggestion.highlights.length}</div>
                <div className="text-sm text-gray-500">見どころ</div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">見どころ</h3>
              <div className="flex flex-wrap gap-2">
                {suggestion.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">コース概要</h3>
              <p className="text-gray-600">{suggestion.summary}</p>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">詳細ルート情報</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={clearError}
                className="text-red-600 underline text-sm mt-2"
              >
                エラーを閉じる
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg">詳細ルートを生成中...</p>
              <p className="text-gray-500 text-sm mt-2">AIが最適なルートを計算しています</p>
            </div>
          ) : course ? (
            <div>
              {/* Course Details Summary */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{course.distance}km</div>
                    <div className="text-xs text-gray-500">総距離</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{course.estimatedTime}分</div>
                    <div className="text-xs text-gray-500">予想時間</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{getDifficultyLabel(course.difficulty)}</div>
                    <div className="text-xs text-gray-500">難易度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{course.waypoints.length}</div>
                    <div className="text-xs text-gray-500">ポイント数</div>
                  </div>
                </div>
              </div>

              {/* Waypoints */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">ルートポイント</h3>
                <div className="space-y-4">
                  {course.waypoints.map((waypoint, index) => (
                    <div
                      key={waypoint.id}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          waypoint.type === 'start' ? 'bg-green-500' :
                          waypoint.type === 'end' ? 'bg-red-500' :
                          waypoint.type === 'landmark' ? 'bg-purple-500' :
                          'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">{waypoint.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            waypoint.type === 'start' ? 'bg-green-100 text-green-800' :
                            waypoint.type === 'end' ? 'bg-red-100 text-red-800' :
                            waypoint.type === 'landmark' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {getWaypointTypeLabel(waypoint.type)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{waypoint.description}</p>
                        
                        <div className="text-sm text-gray-500">
                          <span className="mr-4">
                            📍 緯度: {waypoint.position.latitude.toFixed(6)}
                          </span>
                          <span>
                            経度: {waypoint.position.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">詳細情報を取得してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}