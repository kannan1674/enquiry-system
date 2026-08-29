'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthModalManager({
  initialMode = 'signin',
  onClose,
}: {
  initialMode?: 'signin' | 'signup';
  onClose?: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    router.push(initialMode === 'signup' ? '/signup' : '/signin');
    onClose?.();
  }, [initialMode, onClose, router]);

  return null;
}
