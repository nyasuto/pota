'use client';

import { useState } from 'react';
import { useSuggestions } from '../hooks/useCourses';
import type { CourseRequest } from '../../shared/types';

export default function Home() {
  const { suggestions, isLoading, error, getSuggestions, clearError } = useSuggestions();
  const [courseType, setCourseType] = useState<'walking' | 'cycling' | 'jogging'>('walking');
  const [distance, setDistance] = useState<'short' | 'medium' | 'long'>('short');

  const handleSearch = async () => {
    clearError();
    
    const request: CourseRequest = {
      courseType,
      distance,
      location: {
        latitude: 35.6762, // Default to Tokyo Station
        longitude: 139.6503,
      },
      preferences: {
        scenery: 'nature',
        difficulty: 'easy',
      },
    };

    await getSuggestions(request);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ポタりん V2
          </h1>
          <p className="text-lg text-gray-600">
            AIが提案する最適な散歩・サイクリングコース
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              コースを探す
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望するコースタイプ
                </label>
                <select 
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="walking">散歩コース</option>
                  <option value="cycling">サイクリングコース</option>
                  <option value="jogging">ジョギングコース</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  距離の希望
                </label>
                <select 
                  value={distance}
                  onChange={(e) => setDistance(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="short">短距離（1-3km）</option>
                  <option value="medium">中距離（3-10km）</option>
                  <option value="long">長距離（10km以上）</option>
                </select>
              </div>

              <button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'AIがコースを考えています...' : 'AIにコースを提案してもらう'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              提案されたコース
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
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
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">AIがコースを生成中...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">{suggestion.title}</h4>
                      <div className="text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {suggestion.difficulty === 'easy' ? '初級' : 
                           suggestion.difficulty === 'moderate' ? '中級' : '上級'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{suggestion.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>距離: {suggestion.distance}km</span>
                      <span>所要時間: {suggestion.estimatedTime}分</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">見どころ:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.highlights.map((highlight, index) => (
                          <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                コースを検索すると、ここに結果が表示されます
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}