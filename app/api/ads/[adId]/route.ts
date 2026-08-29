import { NextResponse } from 'next/server';
import { apiCall, apiCallWithAuth } from '@/lib/apiClient';

type RouteContext = {
  params: Promise<{ adId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const { adId } = await context.params;
  const incoming = new URL(req.url);
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const endpoint = `/api/ads/${encodeURIComponent(adId)}${incoming.search}`;

  const response = token
    ? await apiCallWithAuth(endpoint, token, undefined, 'GET')
    : await apiCall(endpoint, { method: 'GET' });

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: response.error || 'Request failed' },
      { status: response.status || 400 },
    );
  }

  return NextResponse.json(response.data, { status: response.status || 200 });
}
