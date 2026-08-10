import type { ApplicationAuthConfig } from '../../../graphql/apollo/types';

export function getCookie(name: string, cookieSource?: string): string | null {
  const source =
    cookieSource ?? (typeof document === 'undefined' ? '' : document.cookie);
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAccessTokenCookie(
  config: ApplicationAuthConfig,
  token: string,
  maxAge: number
): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(config.accessTokenCookieName)}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.max(0, Math.floor(maxAge))}; SameSite=Lax${secure}`;
}

export function clearAccessTokenCookie(config: ApplicationAuthConfig): void {
  document.cookie = `${encodeURIComponent(config.accessTokenCookieName)}=; Path=/; Max-Age=0; SameSite=Lax`;
}
