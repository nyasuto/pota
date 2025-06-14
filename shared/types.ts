// Core types for Potarin API

export interface CourseRequest {
  courseType: 'walking' | 'cycling' | 'jogging';
  distance: 'short' | 'medium' | 'long'; // 1-3km, 3-10km, 10km+
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: {
    scenery?: 'nature' | 'urban' | 'mixed';
    difficulty?: 'easy' | 'moderate' | 'hard';
    avoidHills?: boolean;
  };
}

export interface Position {
  latitude: number;
  longitude: number;
}

// Extended location types for geolocation services
export interface LocationWithAccuracy extends Position {
  accuracy: number;
  timestamp: number;
}

export interface LocationInfo {
  position: Position;
  address?: {
    displayName?: string;
    city?: string;
    prefecture?: string;
    country?: string;
    postcode?: string;
  };
  source: 'gps' | 'geocoding' | 'manual';
}

export interface LocationPreferences {
  useCurrentLocation: boolean;
  savedLocations: Array<{
    id: string;
    name: string;
    position: Position;
    address?: string;
  }>;
  defaultLocation?: Position;
}

export interface Waypoint {
  id: string;
  title: string;
  description: string;
  position: Position;
  type: 'start' | 'checkpoint' | 'landmark' | 'end';
}

export interface CourseSuggestion {
  id: string;
  title: string;
  description: string;
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  courseType: 'walking' | 'cycling' | 'jogging';
  startPoint: Position;
  highlights: string[];
  summary: string;
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  distance: number;
  estimatedTime: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  courseType: 'walking' | 'cycling' | 'jogging';
  waypoints: Waypoint[];
  polyline?: string; // encoded polyline for route visualization
  elevation?: {
    gain: number; // total elevation gain in meters
    profile: Array<{ distance: number; elevation: number }>;
  };
}

// API Request/Response types
export interface SuggestionsRequest {
  request: CourseRequest;
}

export interface SuggestionsResponse {
  suggestions: CourseSuggestion[];
  requestId: string;
  generatedAt: string;
}

export interface DetailsRequest {
  courseId: string;
  suggestion: CourseSuggestion;
}

export interface DetailsResponse {
  course: CourseDetails;
  requestId: string;
  generatedAt: string;
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

// Health check response
export interface HealthResponse {
  status: 'ok' | 'error';
  message: string;
  timestamp?: string;
}