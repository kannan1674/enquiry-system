import { NextResponse } from 'next/server';
import { apiCallWithHeaders } from '@/lib/apiClient';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const body = await clonedReq.json();

    const requestData = {
      email: body.email,
      mobile: body.mobile,
      purpose: body.purpose === 'reset' ? 'reset' : 'verify',
    };

    const response = await apiCallWithHeaders('/api/auth/resend-otp', requestData);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: response.error || 'Failed to resend OTP' },
        { status: response.status || 400 },
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
