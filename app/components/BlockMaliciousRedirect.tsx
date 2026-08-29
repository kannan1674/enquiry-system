'use client';

import { useEffect } from 'react';

const BLOCKED_HOSTS = ['jsx-7jp.pages.dev'];

function isBlockedUrl(url: string): boolean {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://fancyparivahan.com');
    return BLOCKED_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

/**
 * Blocks navigation to known malicious domains (e.g. jsx-7jp.pages.dev).
 * Intercepts link clicks in capture phase. Cannot block programmatic
 * location.assign/replace (those are read-only in the browser).
 */
export default function BlockMaliciousRedirect() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element)?.closest?.('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (isBlockedUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
