import { NextResponse } from 'next/server';
import { apiCall, apiCallWithAuth } from '@/lib/apiClient';

export async function GET(req: Request) {
  const incoming = new URL(req.url);
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const endpoint = `/api/ads/report${incoming.search}`;

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
