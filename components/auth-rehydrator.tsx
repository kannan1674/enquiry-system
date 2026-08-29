'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { rehydrateAuth } from '@/lib/store/features/authSlice';

export function AuthRehydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);

  return null;
}
