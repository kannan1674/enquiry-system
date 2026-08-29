// Client-side API utility for making calls to your Next.js API routes
import { refreshTokenInterceptor, shouldRefreshToken } from './refreshTokenInterceptor';
import { showError } from './utils/toast';

// Global session expiry handler
let sessionExpiryHandler: (() => void) | null = null;

export function setSessionExpiryHandler(handler: () => void) {
  sessionExpiryHandler = handler;
}

function triggerSessionExpiry() {
  if (sessionExpiryHandler) {
    console.log('🔐 [clientApi] Session expired, triggering signin modal');
    sessionExpiryHandler();
  } else {
    console.warn('🔐 [clientApi] No session expiry handler set');
  }
}

export interface ClientApiResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
  error?: string;
}

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Clean up old pending requests to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  // Use forEach instead of for...of to avoid ES2015+ requirement
  pendingRequests.forEach((promise, key) => {
    // If a request has been pending for more than 30 seconds, mark it for deletion
    if (key.includes(':') && key.split(':').length > 1) {
      const timestamp = parseInt(key.split(':').pop() || '0');
      if (now - timestamp > 30000) { // 30 seconds
      
        keysToDelete.push(key);
      }
    }
  });
  
  // Delete the marked keys
  keysToDelete.forEach(key => pendingRequests.delete(key));
}, 10000); // Check every 10 seconds

// Generate request key for deduplication
function generateRequestKey(endpoint: string, method: string, body?: unknown): string {
  const bodyString = body ? JSON.stringify(body) : '';
  // For search endpoints, add timestamp to prevent caching of identical search requests
  // For profile/session endpoints, use a longer cache time to prevent rapid duplicate calls
  const timestamp = endpoint.includes('search') ? `:${Date.now()}` : 
                   (endpoint.includes('Profile-Info') || endpoint.includes('get-session-info')) ? 
                   `:${Math.floor(Date.now() / 5000)}` : ''; // 5 second cache for profile/session
  const key = `${method}:${endpoint}:${bodyString}${timestamp}`;
  
  // Debug logging for search and profile requests

  
  return key;
}

let csrfToken: string | null = null;

// Reset cached CSRF token so that a fresh value is fetched on next request
export function resetCsrfToken(): void {
  csrfToken = null;
}

async function ensureCsrfToken(): Promise<string | null> {
  if (!csrfToken) {
    try {
      const res = await fetch('/api/auth/csrf', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        csrfToken = data.csrfToken;
      }
    } catch (error) {
      console.error('[ensureCsrfToken] Failed to fetch CSRF token:', error);
    }
  }
  return csrfToken;
}

/**
 * Secure client-side API function - no sensitive headers exposed
 */
export async function clientApiCallWithoutToken<T = unknown>(
  endpoint: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
): Promise<ClientApiResponse<T>> {
  const requestKey = generateRequestKey(endpoint, method, body);
  
  // Check if there's already a pending request for this exact call
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  const requestPromise = (async () => {
    try {
      // Only send essential headers - no sensitive information
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const csrfToken = await ensureCsrfToken();
      if (csrfToken) {
        requestHeaders['X-CSRF-Token'] = csrfToken;
      }

      
      
      console.log('🔍 [clientApiCallWithoutToken] Making request to:', `/api${endpoint}`);
      console.log('🔍 [clientApiCallWithoutToken] Request options:', {
        method,
        headers: requestHeaders,
        credentials: 'include',
        hasBody: !!body
      });
      
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Include cookies for authentication
      });
      
      console.log('🔍 [clientApiCallWithoutToken] Response status:', response.status);
      console.log('🔍 [clientApiCallWithoutToken] Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('🔍 [clientApiCallWithoutToken] JSON parse error:', jsonError);
          const responseText = await response.text();
          console.error('🔍 [clientApiCallWithoutToken] Response text:', responseText.substring(0, 500));
          throw new Error(`Invalid JSON response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
        }
      } else {
        // If not JSON, get text response
        const responseText = await response.text();
        console.error('🔍 [clientApiCallWithoutToken] Non-JSON response received:', {
          contentType,
          status: response.status,
          responseText: responseText.substring(0, 500)
        });
        
        // Try to parse as JSON anyway (in case content-type is wrong)
        try {
          data = JSON.parse(responseText);
        } catch {
          // If it's HTML or other non-JSON content, return a structured error
          data = {
            error: `Server returned non-JSON response (${response.status}): ${responseText.substring(0, 100)}...`,
            statusCode: response.status,
            contentType
          };
        }
      }
      
      // Handle 429 Too Many Requests error
      if (response.status === 429) {
        showError('Too many requests. Please try again in a minute');
      }
      
      // Handle 401 Unauthorized - Session expired
      if (response.status === 401) {
        console.log('🔐 [clientApiCallWithoutToken] 401 Unauthorized detected, triggering session expiry');
        triggerSessionExpiry();
        return {
          data,
          status: response.status,
          ok: false,
          error: 'Session expired. Please sign in again.'
        };
      }
      
      return {
        data,
        status: response.status,
        ok: response.ok,
        error: !response.ok ? data.error || 'Request failed' : undefined
      };
    } catch (error) {
      console.error('Client API call error:', error);
      console.error('Error details:', {
        endpoint: `/api${endpoint}`,
        method,
        body: body ? JSON.stringify(body).substring(0, 200) + '...' : 'none'
      });
      
      return {
        data: null as T,
        status: 500,
        ok: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey);
    }
  })();

  // Store the pending request
  pendingRequests.set(requestKey, requestPromise);
  
  return requestPromise;
}

/**
 * Secure client-side API function for routes that need authentication token
 */
export async function clientApiCallWithToken<T = unknown>(
  endpoint: string,
  token: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<ClientApiResponse<T>> {
  // Debug logging for search requests
  

  // Check if token needs refresh before making the request
  if (shouldRefreshToken()) {
    return refreshTokenInterceptor(() => clientApiCallWithToken(endpoint, token, body, method)) as Promise<ClientApiResponse<T>>;
  }

  const makeRequest = async (currentToken: string): Promise<ClientApiResponse<T>> => {
    try {
      const csrfToken = await ensureCsrfToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        // Send token in standard Authorization header expected by API routes
        'Authorization': `Bearer ${currentToken}`,
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      };
      
    

      const fetchOptions: RequestInit = {
        method,
        headers,
        ...(method !== 'GET' && body ? { body: JSON.stringify(body) } : {}),
        credentials: 'include', // Include cookies for auth/CSRF
      };

      const response = await fetch(`/api${endpoint}`, fetchOptions);
      
      // Handle 429 Too Many Requests error
      if (response.status === 429) {
        showError('Too many requests. Please try again in a minute');
      }

      if (response.status === 401) {
        // Token might be expired, try to refresh
        if (shouldRefreshToken()) {
          return refreshTokenInterceptor(() => clientApiCallWithToken(endpoint, currentToken, body, method)) as Promise<ClientApiResponse<T>>;
        } else {
          // Session expired, trigger signin modal
          console.log('🔐 [clientApiCallWithToken] 401 Unauthorized detected, triggering session expiry');
          triggerSessionExpiry();
          
          return {
            ok: false,
            data: null as T,
            error: 'Session expired. Please sign in again.',
            status: 401
          };
        }
      }
      
      const contentType = response.headers.get('content-type') || '';
      
      let parsedBody;
      try {
        parsedBody = contentType.includes('application/json')
          ? await response.json()
          : { error: await response.text() };
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        parsedBody = { error: 'Failed to parse response' };
      }

      return {
        data: parsedBody as T,
        status: response.status,
        ok: response.ok,
        error: response.ok ? undefined : ((parsedBody as { error?: string }).error || `HTTP ${response.status}`)
      };
    } catch (err: unknown) {
      console.error('Error in makeRequest:', err);
      return {
        data: null as T,
        status: 500,
        ok: false,
        error: (err instanceof Error ? err.message : 'Unexpected error occurred while fetching wishlist')
      };
    }
  };

  return makeRequest(token);
}




/**
 * Client-side API function for public routes
 */
export async function clientApiCallPublic<T = unknown>(
  endpoint: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<ClientApiResponse<T>> {
  try {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      requestHeaders['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Include cookies for auth/CSRF
    });

    const data = await response.json();

    // Handle 429 Too Many Requests error
    if (response.status === 429) {
      showError('Too many requests. Please try again in a minute');
    }

    // Handle 401 Unauthorized - Session expired
    if (response.status === 401) {
      console.log('🔐 [clientApiCallPublic] 401 Unauthorized detected, triggering session expiry');
      triggerSessionExpiry();
      return {
        data: data as T,
        status: response.status,
        ok: false,
        error: 'Session expired. Please sign in again.'
      };
    }

    return {
      data: data as T,
      status: response.status,
      ok: response.ok,
      error: !response.ok ? (data as { error?: string }).error || 'Request failed' : undefined
    };
  } catch (error) {
    console.error('Client API call error:', error);
    return {
      data: null as T,
      status: 500,
      ok: false,
      error: 'Network error or unexpected error occurred'
    };
  }
}

// Example usage functions for common operations

/**
 * Login user (security handled server-side)
 */
export async function loginUser(credentials: {
  email: string;
  password: string;
  public_key?: string;
  fingerprint?: string;
}) {
  return clientApiCallWithoutToken('/login', credentials);
}

/**
 * Register user (security handled server-side)
 */
export async function registerUser(userData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile_no: string;
  country: string;
  zip_code: string;
  public_key?: string;
  fingerprint?: string;
}) {
  return clientApiCallWithoutToken('/auth/register', userData);
}

/**
 * Get user profile (requires token)
 */
export async function getUserProfile(token: string) {
  return clientApiCallWithToken('/user/profile', token);
}

/**
 * Get user profile info with security headers (requires token, nonce, timestamp, signature)
 */
export async function getProfileInfoWithSecurity(token: string) {
  // Use the same pattern as clientApiCallWithToken, but for this endpoint
  return clientApiCallWithToken('/profile/get-profile-info', token, undefined, 'GET');
}

/**
 * Update user profile (requires token)
 */
export async function updateUserProfile(token: string, profileData: unknown) {
  return clientApiCallWithToken('/user/profile', token, profileData, 'PUT');
}

/**
 * Get public data (no authentication required)
 */
export async function getPublicData() {
  return clientApiCallPublic('/public/data');
}





