import { NextResponse } from 'next/server';
import { apiCallWithHeaders } from '@/lib/apiClient';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const body = await clonedReq.json();

    const requestData = {
      email: body.email,
      mobile: body.mobile,
      otp: body.otp,
      password: body.password,
      confirmPassword: body.confirmPassword,
    };

    const response = await apiCallWithHeaders('/api/auth/reset-password', requestData);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: response.error || 'Failed to reset password' },
        { status: response.status || 400 },
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
