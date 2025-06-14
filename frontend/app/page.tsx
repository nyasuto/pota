'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSuggestions } from '../hooks/useCourses';
import CurrentLocationButton from '../components/Location/CurrentLocationButton';
import AddressSearch from '../components/Location/AddressSearch';
import LocationPicker from '../components/Location/LocationPicker';
import { GeolocationPosition, TOKYO_DEFAULT_LOCATION } from '../lib/geolocation';
import { GeocodingResult } from '../lib/geocoding';
import type { CourseRequest, CourseSuggestion } from '../../shared/types';

export default function Home() {
  const router = useRouter();
  const { suggestions, isLoading, error, getSuggestions, clearError } = useSuggestions();
  const [courseType, setCourseType] = useState<'walking' | 'cycling' | 'jogging'>('walking');
  const [distance, setDistance] = useState<'short' | 'medium' | 'long'>('short');
  const [selectedLocation, setSelectedLocation] = useState<GeolocationPosition>(TOKYO_DEFAULT_LOCATION);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'current' | 'search' | 'map'>('current');

  const handleSearch = async () => {
    clearError();
    
    const request: CourseRequest = {
      courseType,
      distance,
      location: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      },
      preferences: {
        scenery: 'nature',
        difficulty: 'easy',
      },
    };

    await getSuggestions(request);
  };

  const handleLocationFound = (position: GeolocationPosition) => {
    setSelectedLocation(position);
    setLocationMethod('current');
  };

  const handleAddressSelect = (result: GeocodingResult) => {
    setSelectedLocation({
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: 100, // Assume good accuracy for geocoded results
      timestamp: Date.now(),
    });
    setLocationMethod('search');
  };

  const handleMapLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    setSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: 50, // Assume good accuracy for manual selection
      timestamp: Date.now(),
    });
    setLocationMethod('map');
    setShowLocationPicker(false);
  };

  const handleViewDetails = (suggestion: CourseSuggestion) => {
    // Navigate to course detail page with suggestion data
    const suggestionParam = encodeURIComponent(JSON.stringify(suggestion));
    router.push(`/course/${suggestion.id}?suggestion=${suggestionParam}`);
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

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  出発地点
                </label>
                
                {/* Current Location Button */}
                <div className="mb-3">
                  <CurrentLocationButton
                    onLocationFound={handleLocationFound}
                    showAccuracy={true}
                    className="w-full"
                  />
                </div>

                {/* Address Search */}
                <div className="mb-3">
                  <AddressSearch
                    onLocationSelect={handleAddressSelect}
                    currentLocation={selectedLocation}
                    placeholder="住所や駅名で検索..."
                  />
                </div>

                {/* Map Picker Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {showLocationPicker ? '地図を閉じる' : '地図で選択'}
                  </button>
                </div>

                {/* Location Preview */}
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">選択された位置:</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    緯度: {selectedLocation.latitude.toFixed(6)}, 経度: {selectedLocation.longitude.toFixed(6)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {locationMethod === 'current' && '現在地を使用'}
                    {locationMethod === 'search' && '住所検索で選択'}
                    {locationMethod === 'map' && '地図で選択'}
                  </div>
                </div>

                {/* Map Picker */}
                {showLocationPicker && (
                  <div className="mt-3">
                    <LocationPicker
                      onLocationSelect={handleMapLocationSelect}
                      initialLocation={selectedLocation}
                      height="250px"
                      zoom={15}
                      showAddressPreview={true}
                    />
                  </div>
                )}
              </div>

              <button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>AIがコースを考えています...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>AIにコースを提案してもらう</span>
                  </>
                )}
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
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleViewDetails(suggestion)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                      >
                        詳細を見る
                      </button>
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