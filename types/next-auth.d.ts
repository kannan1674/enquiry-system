import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    accountTypeId: number;
    emailVerified: boolean;
    profileVerificationId: string | null;
    token: string;
    refreshToken: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      accountTypeId: number;
      emailVerified: boolean;
      profileVerificationId: string | null;
    };
    token: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    accountTypeId: number;
    emailVerified: boolean;
    profileVerificationId: string | null;
    accessToken: string;
    refreshToken: string;
  }
} 