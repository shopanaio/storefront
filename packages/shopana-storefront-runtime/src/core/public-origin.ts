let warnedRequestOrigin = false;

/**
 * The public origin of the storefront, on the server: `NEXT_PUBLIC_APP_URL` (the address
 * buyers and search engines use, e.g. `https://shop.example`), else the origin of the request,
 * which behind a proxy may be an internal one (`http://theme:3000` behind a tunnel). Canonical
 * addresses, sitemaps and schema.org documents are built on it. The request's origin comes
 * from its `Host` header, which a client chooses: a production server without
 * `NEXT_PUBLIC_APP_URL` warns once, since a shared cache could keep pages, sitemaps and
 * `robots.txt` built for a forged host.
 */
export function publicOrigin(requestUrl: string | URL): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return new URL(configured).origin;
  if (process.env.NODE_ENV === 'production' && !warnedRequestOrigin) {
    warnedRequestOrigin = true;
    console.warn(
      '[storefront] NEXT_PUBLIC_APP_URL is not set: canonical addresses, sitemaps and ' +
        'robots.txt use the Host of each request. Set it to the public origin of the store.'
    );
  }
  return new URL(requestUrl).origin;
}
