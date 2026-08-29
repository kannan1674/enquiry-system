import { NextResponse } from 'next/server';
import { apiCall, apiCallWithAuth } from '@/lib/apiClient';

type RouteContext = {
  params: Promise<{ enquiryId: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const { enquiryId } = await context.params;
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const endpoint = `/api/enquiries/${encodeURIComponent(enquiryId)}/status`;
  const response = token
    ? await apiCallWithAuth(endpoint, token, body, 'PATCH')
    : await apiCall(endpoint, { method: 'PATCH', body });

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: response.error || 'Request failed' },
      { status: response.status || 400 },
    );
  }

  return NextResponse.json(response.data, { status: response.status || 200 });
}
