import { NextResponse } from 'next/server';
import { apiCallWithHeaders } from '@/lib/apiClient';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const body = await clonedReq.json();

    const requestData = {
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      accountKind: body.accountKind,
      companyName: body.companyName,
      password: body.password,
      confirmPassword: body.confirmPassword,
    };

    const response = await apiCallWithHeaders('/api/auth/signup', requestData);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: response.error || 'Failed to register' },
        { status: response.status || 400 },
      );
    }

    return NextResponse.json(response.data, { status: response.status || 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
