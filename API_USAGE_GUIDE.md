# API Usage Guide

This guide explains how to use the common API function system that handles different authentication scenarios in your Next.js application.

## Overview

The system provides three main types of API calls:

1. **Routes that need headers** (client_id, client_secret) - for authentication endpoints like login/register
2. **Routes that need tokens** (Authorization header) - for protected user endpoints
3. **Routes that need neither** - for public endpoints

## Server-Side API Functions

### 1. `apiCallWithHeaders` - For Authentication Routes

Use this for routes that require client credentials in headers (login, register, etc.).

```typescript
import { apiCallWithHeaders } from '@/lib/apiClient';

// Example: Login route
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const response = await apiCallWithHeaders('/identity/login', {
    Email: body.email,
    Password: body.password,
    PublicKey: body.public_key,
    Fingerprint: body.fingerprint,
  });

  return NextResponse.json(response.data, { status: response.status });
}
```

### 2. `apiCallWithAuth` - For Protected Routes

Use this for routes that require user authentication tokens.

```typescript
import { apiCallWithAuth } from '@/lib/apiClient';

// Example: User profile route
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Authorization token required' },
      { status: 401 }
    );
  }

  const response = await apiCallWithAuth('/user/profile', token);
  return NextResponse.json(response.data, { status: response.status });
}
```

### 3. `apiCallPublic` - For Public Routes

Use this for routes that don't require any authentication.

```typescript
import { apiCallPublic } from '@/lib/apiClient';

// Example: Public data route
export async function GET() {
  const response = await apiCallPublic('/public/data');
  return NextResponse.json(response.data, { status: response.status });
}
```

### 4. `apiCall` - Advanced Configuration

For more complex scenarios, use the main `apiCall` function with custom configuration.

```typescript
import { apiCall } from '@/lib/apiClient';

const response = await apiCall('/custom/endpoint', {
  method: 'POST',
  body: { custom: 'data' },
  requireHeaders: true,
  requireAuth: true,
  token: 'user-token',
  customHeaders: {
    'X-Custom-Header': 'custom-value'
  }
});
```

## Client-Side API Functions

### 1. `clientApiCallWithHeaders` - For Authentication

```typescript
import { clientApiCallWithHeaders } from '@/lib/clientApi';

// Login
const loginResponse = await clientApiCallWithHeaders('/login', {
  email: 'user@example.com',
  password: 'password123'
});

if (loginResponse.ok) {
  console.log('Login successful:', loginResponse.data);
} else {
  console.error('Login failed:', loginResponse.error);
}
```

### 2. `clientApiCallWithAuth` - For Protected Routes

```typescript
import { clientApiCallWithAuth } from '@/lib/clientApi';

// Get user profile
const profileResponse = await clientApiCallWithAuth('/user/profile', userToken);

if (profileResponse.ok) {
  console.log('Profile:', profileResponse.data);
} else {
  console.error('Failed to get profile:', profileResponse.error);
}
```

### 3. `clientApiCallPublic` - For Public Routes

```typescript
import { clientApiCallPublic } from '@/lib/clientApi';

// Get public data
const publicDataResponse = await clientApiCallPublic('/public/data');

if (publicDataResponse.ok) {
  console.log('Public data:', publicDataResponse.data);
} else {
  console.error('Failed to get public data:', publicDataResponse.error);
}
```

## Pre-built Helper Functions

The system includes pre-built functions for common operations:

```typescript
import { 
  loginUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  getPublicData 
} from '@/lib/clientApi';

// Login
const loginResult = await loginUser({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const registerResult = await registerUser({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  mobile_no: '1234567890',
  country: 'US',
  zip_code: '12345'
});

// Get profile (requires token)
const profileResult = await getUserProfile(userToken);

// Update profile (requires token)
const updateResult = await updateUserProfile(userToken, {
  first_name: 'Jane',
  last_name: 'Smith'
});

// Get public data
const publicDataResult = await getPublicData();
```

## Response Format

All API functions return a consistent response format:

```typescript
interface ApiResponse<T = any> {
  data: T;           // The actual response data
  status: number;    // HTTP status code
  ok: boolean;       // Whether the request was successful
  error?: string;    // Error message if request failed
}
```

## Error Handling

Always check the `ok` property and handle errors appropriately:

```typescript
const response = await apiCallWithHeaders('/some/endpoint', data);

if (response.ok) {
  // Handle success
  console.log('Success:', response.data);
} else {
  // Handle error
  console.error('Error:', response.error);
  console.error('Status:', response.status);
}
```

## Environment Variables

Make sure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api-base-url.com
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

## Best Practices

1. **Always handle errors**: Check the `ok` property and provide user-friendly error messages
2. **Use TypeScript**: Define interfaces for your request/response data
3. **Consistent naming**: Use the same endpoint paths on both client and server
4. **Token management**: Store and retrieve tokens securely (e.g., in HTTP-only cookies or secure storage)
5. **Logging**: Log errors for debugging but don't expose sensitive information to users

## Example Route Structure

```
/api/
├── login/                    # Uses apiCallWithHeaders
├── auth/
│   ├── register/            # Uses apiCallWithHeaders
│   ├── forgot-password/     # Uses apiCallWithHeaders
│   └── reset-password/      # Uses apiCallWithHeaders
├── user/
│   └── profile/             # Uses apiCallWithAuth
└── public/
    └── data/                # Uses apiCallPublic
```

This structure ensures consistent authentication handling across your entire application. 