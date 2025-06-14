import type {
  SuggestionsRequest,
  SuggestionsResponse,
  DetailsRequest,
  DetailsResponse,
  HealthResponse,
  ApiError as ApiErrorType,
} from '../../shared/types';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function with type safety
async function apiRequest<TResponse>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  const { method = 'GET', body, headers = {} } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      let errorData: ApiErrorType | undefined;
      try {
        errorData = await response.json();
      } catch {
        // If parsing fails, create a generic error
      }

      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData?.error,
        errorData?.details
      );
    }

    const data = await response.json();
    return data as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

// API client class with typed methods
export class PotarinApiClient {
  // Health check endpoint
  static async health(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>('/api/v1/health');
  }

  // Get course suggestions from AI
  static async getSuggestions(request: SuggestionsRequest): Promise<SuggestionsResponse> {
    return apiRequest<SuggestionsResponse>('/api/v1/suggestions', {
      method: 'POST',
      body: request,
    });
  }

  // Get detailed course information with waypoints
  static async getDetails(request: DetailsRequest): Promise<DetailsResponse> {
    return apiRequest<DetailsResponse>('/api/v1/details', {
      method: 'POST',
      body: request,
    });
  }
}

// Export individual API functions for convenience
export const api = {
  health: PotarinApiClient.health,
  getSuggestions: PotarinApiClient.getSuggestions,
  getDetails: PotarinApiClient.getDetails,
};

// Export error class for error handling (already exported above)