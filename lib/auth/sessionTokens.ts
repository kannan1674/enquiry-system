const REFRESH_KEY = /^(refresh[_-]?token|reference[_-]?token)$/i;
const EXPIRES_KEY = /^(expires[_-]?in|expiresInSeconds|expires_in_seconds)$/i;
const EXPIRES_MIN_KEY = /^(expiresInMinutes|expires_in_minutes)$/i;
const ACCESS_KEY = /^(token|access[_-]?token)$/i;

function walk(input: unknown, visit: (key: string, value: unknown) => boolean) {
  const seen = new Set<unknown>();
  const queue: unknown[] = [input];
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) {
      continue;
    }
    seen.add(current);
    for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
      if (visit(key, value)) {
        return;
      }
      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }
}

export function extractSessionTokens(payload: unknown) {
  let accessToken = '';
  let refreshToken = '';
  let expiresIn: number | undefined;

  walk(payload, (key, value) => {
    if (typeof value === 'string' && value && ACCESS_KEY.test(key) && !accessToken) {
      accessToken = value;
    }
    if (typeof value === 'string' && value && REFRESH_KEY.test(key) && !refreshToken) {
      refreshToken = value;
    }
    if (EXPIRES_KEY.test(key) && expiresIn == null) {
      const parsed = typeof value === 'number' ? value : Number(value);
      if (Number.isFinite(parsed) && parsed > 0) {
        expiresIn = parsed;
      }
    }
    if (EXPIRES_MIN_KEY.test(key) && expiresIn == null) {
      const parsed = typeof value === 'number' ? value : Number(value);
      if (Number.isFinite(parsed) && parsed > 0) {
        expiresIn = parsed * 60;
      }
    }
    return false;
  });

  if (refreshToken && refreshToken === accessToken) {
    refreshToken = '';
  }

  return { accessToken, refreshToken, expiresIn };
}
