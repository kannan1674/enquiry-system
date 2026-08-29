// Synchronous version for client-side usage
export function getCookie(name: string): string | null {
  // Client-side cookie access
  if (typeof document !== 'undefined') {
    // Allow optional whitespace after semicolons when matching cookie name
    const match = document.cookie.match(
      new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'),
    );

    const value = match ? decodeURIComponent(match[1]) : null;
    if (process.env.NODE_ENV !== 'production') {
  
    }
    return value;
  }

  // Server-side: return null for synchronous version
  return null;
}

// Asynchronous version for server-side usage
export async function getCookieAsync(name: string): Promise<string | null> {
  // Client-side cookie access
  if (typeof document !== 'undefined') {
    // Allow optional whitespace after semicolons when matching cookie name
    const match = document.cookie.match(
      new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'),
    );

    const value = match ? decodeURIComponent(match[1]) : null;
    if (process.env.NODE_ENV !== 'production') {
    
    }
    return value;
  }

  // Server-side cookie access using Next.js headers API (if available)
  try {
    const { cookies } = await import('next/headers');
    const cookie = (await cookies()).get(name);
    const value = cookie ? cookie.value : null;
    if (process.env.NODE_ENV !== 'production') {

    }
    return value;
  } catch {
    return null;
  }
}

export function getCsrfToken(): string | null {
  return getCookie('csrf-token');
}

export async function getCsrfTokenAsync(): Promise<string | null> {
  return await getCookieAsync('csrf-token');
}

type SameSiteOption = 'lax' | 'strict' | 'none';

interface CookieOptions {
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: SameSiteOption;
  secure?: boolean;
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof document === 'undefined') return;

  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (typeof options.maxAgeSeconds === 'number' && Number.isFinite(options.maxAgeSeconds)) {
    cookie += `; Max-Age=${options.maxAgeSeconds}`;
  }

  cookie += `; Path=${options.path || '/'}`;

  const sameSite = (options.sameSite || 'lax').toLowerCase() as SameSiteOption;
  const normalizedSameSite: SameSiteOption = ['lax', 'strict', 'none'].includes(sameSite)
    ? sameSite
    : 'lax';
  cookie += `; SameSite=${normalizedSameSite.charAt(0).toUpperCase()}${normalizedSameSite.slice(1)}`;

  const isSecureContext = (() => {
    if (typeof options.secure === 'boolean') {
      return options.secure;
    }
    if (typeof window === 'undefined') {
      return false;
    }
    return window.location.protocol === 'https:';
  })();

  if (isSecureContext || normalizedSameSite === 'none') {
    cookie += '; Secure';
  }

  document.cookie = cookie;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[cookieUtils] setCookie("${name}", "${value}",`, options, ')');
    console.log(`[cookieUtils] Full cookie string:`, cookie);
  }
  
  // Verify the cookie was set by reading it back
  setTimeout(() => {
    const savedValue = getCookie(name);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[cookieUtils] Verification - getCookie("${name}") ->`, savedValue);
    }
  }, 100);
}

export function deleteCookie(name: string): void {
  setCookie(name, '', { maxAgeSeconds: 0 });
}

// Debug function to list all cookies
export function listAllCookies(): void {
  if (typeof document === 'undefined') return;
  
  console.log('🔍 [cookieUtils] All cookies:');
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    console.log(`  ${name}: ${value}`);
  });
}
