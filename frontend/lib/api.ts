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
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

// Retry configuration for different endpoints
const RETRY_CONFIG = {
  '/api/v1/health': { retries: 2, delay: 500 },
  '/api/v1/suggestions': { retries: 3, delay: 2000 },
  '/api/v1/details': { retries: 3, delay: 2000 },
} as const;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
    public details?: any,
    public isRetryable: boolean = false,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  // Check if error is retryable
  static isRetryable(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.isRetryable || 
             error.status >= 500 || 
             error.status === 429 || // Rate limit
             error.status === 408 || // Request timeout
             error.status === 0;     // Network error
    }
    return error instanceof Error && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('timeout')
    );
  }
}

// Network error class
export class NetworkError extends ApiError {
  constructor(message: string = 'ネットワークエラーが発生しました') {
    super(message, 0, 'network_error', undefined, true);
    this.name = 'NetworkError';
  }
}

// Timeout error class
export class TimeoutError extends ApiError {
  constructor(message: string = 'リクエストがタイムアウトしました') {
    super(message, 408, 'timeout_error', undefined, true);
    this.name = 'TimeoutError';
  }
}

// Utility functions
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), timeout);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced API request function with retry logic and timeout handling
async function apiRequest<TResponse>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<TResponse> {
  const { 
    method = 'GET', 
    body, 
    headers = {}, 
    timeout = DEFAULT_TIMEOUT,
    retries = RETRY_CONFIG[endpoint as keyof typeof RETRY_CONFIG]?.retries ?? DEFAULT_RETRY_COUNT,
    retryDelay = RETRY_CONFIG[endpoint as keyof typeof RETRY_CONFIG]?.delay ?? DEFAULT_RETRY_DELAY
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': '2.0.0',
      'X-Request-ID': crypto.randomUUID(),
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[API] ${method} ${endpoint} - Attempt ${attempt + 1}/${retries + 1}`);

      // Create fetch promise with timeout
      const fetchPromise = fetch(url, requestOptions);
      const timeoutPromise = createTimeoutPromise(timeout);

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        let errorData: ApiErrorType | undefined;
        let responseText = '';
        
        try {
          responseText = await response.text();
          errorData = JSON.parse(responseText);
        } catch {
          // If parsing fails, use the raw text or create a generic error
        }

        const isRetryable = response.status >= 500 || 
                           response.status === 429 || 
                           response.status === 408;

        const apiError = new ApiError(
          errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData?.error,
          errorData?.details,
          isRetryable,
          errorData?.code
        );

        // Don't retry client errors (4xx except 408 and 429)
        if (!isRetryable && attempt < retries) {
          throw apiError;
        }

        lastError = apiError;
        
        if (attempt === retries) {
          throw apiError;
        }
      } else {
        // Success - parse and return response
        const responseText = await response.text();
        
        if (!responseText) {
          return {} as TResponse;
        }

        try {
          const data = JSON.parse(responseText);
          console.log(`[API] ${method} ${endpoint} - Success on attempt ${attempt + 1}`);
          return data as TResponse;
        } catch (parseError) {
          throw new ApiError(
            'サーバーからの応答の解析に失敗しました',
            response.status,
            'parse_error',
            { parseError: parseError instanceof Error ? parseError.message : String(parseError) }
          );
        }
      }
    } catch (error) {
      lastError = error;

      // Handle specific error types
      if (error instanceof TimeoutError) {
        console.log(`[API] ${method} ${endpoint} - Timeout on attempt ${attempt + 1}`);
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log(`[API] ${method} ${endpoint} - Network error on attempt ${attempt + 1}`);
        lastError = new NetworkError();
      } else if (error instanceof ApiError && !error.isRetryable) {
        // Don't retry non-retryable errors
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        if (lastError instanceof ApiError) {
          throw lastError;
        }
        
        // Convert unknown errors to NetworkError
        throw new NetworkError(
          lastError instanceof Error ? lastError.message : 'Unknown network error'
        );
      }

      // Wait before retrying (exponential backoff)
      const delayMs = retryDelay * Math.pow(2, attempt);
      console.log(`[API] ${method} ${endpoint} - Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  // This should never be reached, but just in case
  throw lastError instanceof Error ? lastError : new NetworkError();
}

// Circuit breaker state
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold = 5,
    private timeout = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ApiError('Circuit breaker is open', 503, 'circuit_breaker_open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Global circuit breakers for each endpoint
const circuitBreakers = {
  health: new CircuitBreaker(3, 30000),
  suggestions: new CircuitBreaker(5, 60000),
  details: new CircuitBreaker(5, 60000),
};

// API client class with typed methods
export class PotarinApiClient {
  // Health check endpoint with circuit breaker
  static async health(options?: { timeout?: number }): Promise<HealthResponse> {
    return circuitBreakers.health.execute(() =>
      apiRequest<HealthResponse>('/api/v1/health', {
        timeout: options?.timeout ?? 5000, // Shorter timeout for health checks
      })
    );
  }

  // Get course suggestions from AI with circuit breaker
  static async getSuggestions(
    request: SuggestionsRequest, 
    options?: { timeout?: number; retries?: number }
  ): Promise<SuggestionsResponse> {
    return circuitBreakers.suggestions.execute(() =>
      apiRequest<SuggestionsResponse>('/api/v1/suggestions', {
        method: 'POST',
        body: request,
        timeout: options?.timeout ?? 45000, // Longer timeout for AI requests
        retries: options?.retries,
      })
    );
  }

  // Get detailed course information with waypoints and circuit breaker
  static async getDetails(
    request: DetailsRequest,
    options?: { timeout?: number; retries?: number }
  ): Promise<DetailsResponse> {
    return circuitBreakers.details.execute(() =>
      apiRequest<DetailsResponse>('/api/v1/details', {
        method: 'POST',
        body: request,
        timeout: options?.timeout ?? 45000, // Longer timeout for AI requests
        retries: options?.retries,
      })
    );
  }

  // Utility method to check API connectivity
  static async isHealthy(): Promise<boolean> {
    try {
      await PotarinApiClient.health({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  // Method to get circuit breaker status
  static getCircuitBreakerStatus() {
    return {
      health: circuitBreakers.health,
      suggestions: circuitBreakers.suggestions,
      details: circuitBreakers.details,
    };
  }
}

// Export individual API functions for convenience
export const api = {
  health: PotarinApiClient.health,
  getSuggestions: PotarinApiClient.getSuggestions,
  getDetails: PotarinApiClient.getDetails,
  isHealthy: PotarinApiClient.isHealthy,
  getCircuitBreakerStatus: PotarinApiClient.getCircuitBreakerStatus,
};

// Utility hooks and functions for React components
export const createApiHook = <T>(apiCall: () => Promise<T>) => {
  return () => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const execute = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiCall();
        setData(result);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new NetworkError();
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    }, []);

    return { data, loading, error, execute };
  };
};

// Connection status monitoring
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isOnline) {
      // Check API health periodically when online
      const checkHealth = async () => {
        try {
          const healthy = await api.isHealthy();
          setIsApiHealthy(healthy);
        } catch {
          setIsApiHealthy(false);
        }
      };

      checkHealth();
      intervalId = setInterval(checkHealth, 30000); // Check every 30 seconds
    } else {
      setIsApiHealthy(false);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOnline]);

  return { isOnline, isApiHealthy };
}

// Import React for hooks
import { useState, useCallback, useEffect } from 'react';