/**
 * Where the storefront runs relative to the page that shows it.
 *
 * - `first-party`: the storefront is the top-level site; cookies use `SameSite=Lax`.
 * - `embedded`: the storefront is rendered in a third-party iframe; cookies use
 *   `SameSite=None; Secure; Partitioned`, so browsers keep them in the embedding site partition.
 */
export type CookiePolicy = 'first-party' | 'embedded';

export const DEFAULT_COOKIE_POLICY: CookiePolicy = 'first-party';

export type CookieSameSite = 'Lax' | 'Strict' | 'None';

export interface CookieAttributes {
  sameSite: CookieSameSite;
  secure: boolean;
  partitioned: boolean;
}

export interface ResolveCookieAttributesOptions {
  /** SameSite for the first-party policy; `Lax` by default. */
  firstPartySameSite?: Exclude<CookieSameSite, 'None'>;
  /** Secure for the first-party policy; the embedded policy is always Secure. */
  secure?: boolean;
}

export function resolveCookieAttributes(
  policy: CookiePolicy = DEFAULT_COOKIE_POLICY,
  options: ResolveCookieAttributesOptions = {}
): CookieAttributes {
  if (policy === 'embedded') {
    return { sameSite: 'None', secure: true, partitioned: true };
  }
  return {
    sameSite: options.firstPartySameSite ?? 'Lax',
    secure: options.secure ?? false,
    partitioned: false,
  };
}

export interface SerializeCookieOptions extends CookieAttributes {
  path?: string;
  /** Seconds; `0` deletes the cookie. */
  maxAge?: number;
  httpOnly?: boolean;
  domain?: string;
}

/** Serializes one `Set-Cookie` / `document.cookie` value. Deletion keeps the same attributes. */
export function serializeCookie(
  name: string,
  value: string,
  options: SerializeCookieOptions
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? '/'}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push('HttpOnly');
  parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push('Secure');
  if (options.partitioned) parts.push('Partitioned');
  return parts.join('; ');
}

/** Reads one cookie from a `Cookie` header or `document.cookie`; the name is matched literally. */
export function readCookie(
  source: string | undefined | null,
  name: string
): string | null {
  if (!source) return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
