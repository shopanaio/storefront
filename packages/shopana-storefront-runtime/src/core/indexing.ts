/**
 * Whether search engines are kept off the whole storefront (a stage): `STOREFRONT_NOINDEX` set
 * to `true` or `1` on the server. Every response then says `X-Robots-Tag: noindex, nofollow`,
 * `robots.txt` names no sitemap and the sitemaps answer 404. Crawling stays allowed, so pages
 * already in an index are read again and dropped from it.
 */
export function isSiteNoindex(): boolean {
  const value = process.env.STOREFRONT_NOINDEX?.trim().toLowerCase();
  return value === 'true' || value === '1';
}

/** The `X-Robots-Tag` of every response of a site kept off search engines. */
export const NOINDEX_ROBOTS_TAG = 'noindex, nofollow';
