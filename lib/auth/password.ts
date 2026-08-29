export const PASSWORD_RULE_MESSAGE =
  'Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character.';

export const PASSWORD_RULES = [
  { id: 'length', label: '8 Chars', test: (value: string) => value.length >= 8 && value.length <= 128 },
  { id: 'upper', label: 'A-Z', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'lower', label: 'a-z', test: (value: string) => /[a-z]/.test(value) },
  { id: 'number', label: '123', test: (value: string) => /\d/.test(value) },
  { id: 'special', label: '@#$', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export type PasswordStrengthLabel = 'Weak' | 'Fair' | 'Good' | 'Strong';

export function getPasswordChecks(value: string) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(value),
  }));
}

export function isStrongPassword(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function getPasswordStrength(value: string): {
  score: number;
  label: PasswordStrengthLabel;
  barClass: string;
  textClass: string;
} {
  const score = getPasswordChecks(value).filter((rule) => rule.passed).length;

  if (score <= 1) {
    return { score, label: 'Weak', barClass: 'bg-red-500 w-1/5', textClass: 'text-red-600' };
  }
  if (score <= 3) {
    return { score, label: 'Fair', barClass: 'bg-amber-500 w-2/5', textClass: 'text-amber-600' };
  }
  if (score === 4) {
    return { score, label: 'Good', barClass: 'bg-yellow-500 w-3/5', textClass: 'text-yellow-600' };
  }
  return { score, label: 'Strong', barClass: 'bg-emerald-500 w-full', textClass: 'text-emerald-600' };
}
