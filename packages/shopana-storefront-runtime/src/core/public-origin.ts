let warnedRequestOrigin = false;

/**
 * The public origin of the storefront, on the server: `STOREFRONT_PUBLIC_URL` (the address
 * buyers and search engines use, e.g. `https://shop.example`), else the origin of the request,
 * which behind a proxy may be an internal one. Canonical addresses, sitemaps and schema.org
 * documents are built on it. The request's origin comes from its `Host` header, which a client
 * chooses: a production server without `STOREFRONT_PUBLIC_URL` warns once, since a shared
 * cache could keep pages, sitemaps and `robots.txt` built for a forged host.
 */
export function publicOrigin(requestUrl: string | URL): string {
  const configured = process.env.STOREFRONT_PUBLIC_URL?.trim();
  if (configured) return new URL(configured).origin;
  if (process.env.NODE_ENV === 'production' && !warnedRequestOrigin) {
    warnedRequestOrigin = true;
    console.warn(
      '[storefront] STOREFRONT_PUBLIC_URL is not set: canonical addresses, sitemaps and ' +
        'robots.txt use the Host of each request. Set it to the public origin of the store.'
    );
  }
  return new URL(requestUrl).origin;
}
