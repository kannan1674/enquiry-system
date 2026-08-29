import { FieldErrors } from 'react-hook-form';
import { showError } from '@/lib/utils/toast';

function collectMessage(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if ('message' in value && typeof value.message === 'string' && value.message) {
    return value.message;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    const message = collectMessage(nested);
    if (message) {
      return message;
    }
  }

  return null;
}

export function toastFormErrors(errors: FieldErrors) {
  showError(collectMessage(errors) || 'Please check the form and try again');
}
