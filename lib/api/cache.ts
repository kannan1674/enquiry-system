const store = new Map<string, { data: unknown; at: number }>();

export function getCached<T>(key: string, ttlMs: number): T | null {
  const hit = store.get(key);
  if (!hit || Date.now() - hit.at > ttlMs) {
    return null;
  }
  return hit.data as T;
}

export function setCached<T>(key: string, data: T) {
  store.set(key, { data, at: Date.now() });
}

export function clearCached(key: string) {
  store.delete(key);
}

export function peekCached<T>(key: string): T | null {
  const hit = store.get(key);
  return hit ? (hit.data as T) : null;
}
