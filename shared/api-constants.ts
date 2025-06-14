// API Constants for Potarin Frontend

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  HEALTH: '/api/v1/health',
  SUGGESTIONS: '/api/v1/suggestions',
  DETAILS: '/api/v1/details',
} as const;

export const COURSE_TYPES = {
  WALKING: 'walking',
  CYCLING: 'cycling',
  JOGGING: 'jogging',
} as const;

export const DISTANCE_TYPES = {
  SHORT: 'short',    // 1-3km
  MEDIUM: 'medium',  // 3-10km
  LONG: 'long',      // 10km+
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MODERATE: 'moderate',
  HARD: 'hard',
} as const;

export const SCENERY_TYPES = {
  NATURE: 'nature',
  URBAN: 'urban',
  MIXED: 'mixed',
} as const;

export const WAYPOINT_TYPES = {
  START: 'start',
  CHECKPOINT: 'checkpoint',
  LANDMARK: 'landmark',
  END: 'end',
} as const;

// Distance ranges in kilometers
export const DISTANCE_RANGES = {
  [DISTANCE_TYPES.SHORT]: { min: 1, max: 3 },
  [DISTANCE_TYPES.MEDIUM]: { min: 3, max: 10 },
  [DISTANCE_TYPES.LONG]: { min: 10, max: 50 },
} as const;

// Estimated time multipliers (minutes per km)
export const TIME_MULTIPLIERS = {
  [COURSE_TYPES.WALKING]: 12,   // 5 km/h
  [COURSE_TYPES.JOGGING]: 6,    // 10 km/h
  [COURSE_TYPES.CYCLING]: 3,    // 20 km/h
} as const;