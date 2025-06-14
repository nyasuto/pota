'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getLocationSuggestions, 
  GeocodingResult, 
  formatDisplayName,
  isInJapan 
} from '../../lib/geocoding';
import { GeolocationPosition } from '../../lib/geolocation';

interface AddressSearchProps {
  onLocationSelect: (location: GeocodingResult) => void;
  currentLocation?: GeolocationPosition;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  initialValue?: string;
}

export default function AddressSearch({
  onLocationSelect,
  currentLocation,
  placeholder = '住所や場所名を入力...',
  className = '',
  disabled = false,
  initialValue = '',
}: AddressSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search function
  const searchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await getLocationSuggestions(searchQuery, currentLocation);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Address search failed:', err);
      setError('検索に失敗しました。もう一度お試しください。');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchSuggestions(value);
    }, 300);
  }, [searchSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: GeocodingResult) => {
    setQuery(formatDisplayName(suggestion.displayName));
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onLocationSelect(suggestion);
  }, [onLocationSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionSelect]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const getSuggestionIcon = (suggestion: GeocodingResult) => {
    const { category, type } = suggestion;
    
    if (category === 'railway' || type === 'station') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
        </svg>
      );
    }
    
    if (category === 'leisure' || type === 'park') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    }
    
    if (category === 'shop' || category === 'amenity') {
      return (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  const formatSuggestionText = (suggestion: GeocodingResult) => {
    const displayName = formatDisplayName(suggestion.displayName);
    
    // Highlight the search query in the display name
    if (query.length > 1) {
      const regex = new RegExp(`(${query})`, 'gi');
      const parts = displayName.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="font-semibold text-blue-600">{part}</span>
        ) : (
          <span key={index}>{part}</span>
        )
      );
    }
    
    return displayName;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            placeholder-gray-500
          `}
        />
        
        {/* Search Icon / Loading Spinner */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`
                w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3
                border-b border-gray-100 last:border-b-0
                ${index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''}
                transition-colors duration-150
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getSuggestionIcon(suggestion)}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {formatSuggestionText(suggestion)}
                </div>
                
                {suggestion.address && (
                  <div className="text-xs text-gray-600 mt-1">
                    {[
                      suggestion.address.prefecture,
                      suggestion.address.city,
                      suggestion.address.district,
                    ].filter(Boolean).join(' • ')}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${isInJapan(suggestion) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  `}>
                    {suggestion.category}
                  </span>
                  
                  {suggestion.importance > 0.7 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      人気
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && suggestions.length === 0 && !isLoading && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
          「{query}」の検索結果が見つかりませんでした
        </div>
      )}
    </div>
  );
}