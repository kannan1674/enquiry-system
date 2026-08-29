import { NextResponse } from 'next/server';
import { apiCallWithHeaders } from '@/lib/apiClient';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const body = await clonedReq.json();

    const requestData = {
      email: body.email,
      mobile: body.mobile,
    };

    const response = await apiCallWithHeaders('/api/auth/forgot-password', requestData);

    if (!response.ok) {
      console.log('❌ [forgot-password] Backend call failed:', response.error);
      return NextResponse.json(
        { success: false, message: response.error || 'Failed to process forgot password request' },
        { status: response.status || 400 },
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
