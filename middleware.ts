import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');

    // Effective host/proto when behind a proxy
    const effectiveHost =
      request.headers.get('x-forwarded-host') ??
      request.headers.get('host') ??
      request.nextUrl.hostname;

    // Allow requests from the production domain and localhost for development
    const allowedOrigins = [
      'localhost',
      '127.0.0.1',
    ];

    if (origin) {
      try {
        const originHost = new URL(origin).host; // includes port
        const oh = originHost.split(':')[0].toLowerCase();
        const hh = effectiveHost.split(':')[0].toLowerCase();

        // Check if origin is in allowed list or same site
        const isAllowedOrigin = allowedOrigins.some(allowed => 
          oh === allowed || oh.endsWith(`.${allowed}`)
        );
        const sameSite = oh === hh || oh.endsWith(`.${hh}`) || hh.endsWith(`.${oh}`);
        
        if (!isAllowedOrigin && !sameSite) {
          console.log(`Origin blocked: ${origin} (effective host: ${effectiveHost})`);
          return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
        }
      } catch (error) {
        console.log(`Origin validation error: ${error}`);
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
    }

    // --- OPTIONAL: if you are actually calling the API from a different subdomain,
    // add CORS headers (and handle preflight).
    const proto =
      request.headers.get('x-forwarded-proto') ??
      request.nextUrl.protocol.replace(':', '');
    const originForCors = origin ?? `${proto}://${effectiveHost}`;
    response.headers.set('Access-Control-Allow-Origin', originForCors);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, Authorization');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // Skip CSRF for safe methods & auth/public endpoints
    const isSafe = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    const p = request.nextUrl.pathname;
    const skipCsrf =
      isSafe ||
      p.startsWith('/api/auth') ||
      p.startsWith('/api/backend') ||
      p.startsWith('/api/enquiries') ||
      p.startsWith('/api/ads');

    if (!skipCsrf) {
      const csrfCookie = request.cookies.get('csrf-token')?.value;
      const csrfHeader = request.headers.get('x-csrf-token');
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
      }
    }

    // Security headers (keep)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'same-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // CSP connect-src (keep your NEXT_PUBLIC_API_URL)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const connectSrc = ["'self'"];
    try {
      if (apiUrl) connectSrc.push(new URL(apiUrl).origin);
    } catch {}
    response.headers.set('Content-Security-Policy', `default-src 'self'; connect-src ${connectSrc.join(' ')}; form-action 'self'`);
  }

  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 