import { useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type {
  CourseRequest,
  CourseSuggestion,
  CourseDetails,
  SuggestionsResponse,
  DetailsResponse,
} from '../../shared/types';

// Hook state types
interface UseCoursesState {
  suggestions: CourseSuggestion[];
  selectedCourse: CourseDetails | null;
  isLoadingSuggestions: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  lastRequestId: string | null;
}

interface UseCoursesActions {
  getSuggestions: (request: CourseRequest) => Promise<void>;
  getDetails: (suggestion: CourseSuggestion) => Promise<void>;
  clearError: () => void;
  clearSuggestions: () => void;
  clearSelectedCourse: () => void;
}

type UseCourses = UseCoursesState & UseCoursesActions;

// Main hook for course suggestions and details
export function useCourses(): UseCourses {
  const [state, setState] = useState<UseCoursesState>({
    suggestions: [],
    selectedCourse: null,
    isLoadingSuggestions: false,
    isLoadingDetails: false,
    error: null,
    lastRequestId: null,
  });

  // Get course suggestions from API
  const getSuggestions = useCallback(async (request: CourseRequest) => {
    setState(prev => ({
      ...prev,
      isLoadingSuggestions: true,
      error: null,
      suggestions: [],
    }));

    try {
      const response: SuggestionsResponse = await api.getSuggestions({ request });
      
      setState(prev => ({
        ...prev,
        suggestions: response.suggestions,
        lastRequestId: response.requestId,
        isLoadingSuggestions: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'コース提案の取得に失敗しました';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoadingSuggestions: false,
        suggestions: [],
      }));
    }
  }, []);

  // Get detailed course information
  const getDetails = useCallback(async (suggestion: CourseSuggestion) => {
    setState(prev => ({
      ...prev,
      isLoadingDetails: true,
      error: null,
      selectedCourse: null,
    }));

    try {
      const response: DetailsResponse = await api.getDetails({
        courseId: suggestion.id,
        suggestion,
      });
      
      setState(prev => ({
        ...prev,
        selectedCourse: response.course,
        isLoadingDetails: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'コース詳細の取得に失敗しました';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoadingDetails: false,
      }));
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      suggestions: [],
      lastRequestId: null,
    }));
  }, []);

  // Clear selected course
  const clearSelectedCourse = useCallback(() => {
    setState(prev => ({ ...prev, selectedCourse: null }));
  }, []);

  return {
    ...state,
    getSuggestions,
    getDetails,
    clearError,
    clearSuggestions,
    clearSelectedCourse,
  };
}

// Simplified hook for just getting suggestions
export function useSuggestions() {
  const {
    suggestions,
    isLoadingSuggestions: isLoading,
    error,
    getSuggestions,
    clearError,
    clearSuggestions,
  } = useCourses();

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearError,
    clearSuggestions,
  };
}

// Simplified hook for just getting course details
export function useCourseDetails() {
  const {
    selectedCourse,
    isLoadingDetails: isLoading,
    error,
    getDetails,
    clearError,
    clearSelectedCourse,
  } = useCourses();

  return {
    course: selectedCourse,
    isLoading,
    error,
    getDetails,
    clearError,
    clearCourse: clearSelectedCourse,
  };
}