import { NextResponse } from 'next/server';
import { apiCall, apiCallWithAuth } from '@/lib/apiClient';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(req: Request, context: RouteContext, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') {
  const { path } = await context.params;
  const incoming = new URL(req.url);
  const endpoint = `/api/${path.join('/')}${incoming.search}`;
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

  let body: unknown;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await req.json();
    } catch {
      body = undefined;
    }
  }

  const response = token
    ? await apiCallWithAuth(endpoint, token, body, method)
    : await apiCall(endpoint, { method, body });

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: response.error || 'Request failed' },
      { status: response.status || 400 },
    );
  }

  return NextResponse.json(response.data, { status: response.status || 200 });
}

export async function GET(req: Request, context: RouteContext) {
  return proxy(req, context, 'GET');
}

export async function POST(req: Request, context: RouteContext) {
  return proxy(req, context, 'POST');
}

export async function PUT(req: Request, context: RouteContext) {
  return proxy(req, context, 'PUT');
}

export async function PATCH(req: Request, context: RouteContext) {
  return proxy(req, context, 'PATCH');
}

export async function DELETE(req: Request, context: RouteContext) {
  return proxy(req, context, 'DELETE');
}
