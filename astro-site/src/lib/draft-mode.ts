import type { AstroCookies } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';

export function isDraftMode(cookies: AstroCookies): boolean {
  return cookies.has(perspectiveCookieName);
}

export function getDraftModeProps(cookies: AstroCookies) {
  return {
    perspectiveCookie: cookies.get(perspectiveCookieName)?.value ?? undefined,
  };
}
