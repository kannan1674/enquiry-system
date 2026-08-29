import { NextResponse } from 'next/server';
import { apiCallWithHeaders } from '@/lib/apiClient';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const body = await clonedReq.json();

    const requestData = {
      email: body.email,
      mobile: body.mobile,
      password: body.password,
    };

    const response = await apiCallWithHeaders('/api/auth/signin', requestData);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: response.error || 'Failed to sign in' },
        { status: response.status || 400 },
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
