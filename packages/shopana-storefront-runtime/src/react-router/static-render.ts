/**
 * The request of the static site builder: a guest's page rendered whole, for every buyer.
 * The header's value says what to render: `page` the page of the address, `shell` its layout
 * and a skeleton the browser fills in (a cart, an account, a search).
 */
export const STATIC_RENDER_HEADER = 'x-shopana-static-render';

export type StaticRenderMode = 'page' | 'shell';

/** What a request asks the static render for; null for any other request. */
export function staticRenderMode(headers: {
  get(name: string): string | null;
}): StaticRenderMode | null {
  const value = headers.get(STATIC_RENDER_HEADER);
  if (value === null) return null;
  return value === 'shell' ? 'shell' : 'page';
}

/**
 * Headers of a request rendered for the static site: no cookie, so no cart, session or
 * visitor id reaches the render, its cache or its HTML, and no session token goes to the API.
 */
export function guestHeaders(headers: Headers): Headers {
  const guest = new Headers(headers);
  guest.delete('cookie');
  guest.delete('authorization');
  guest.delete('x-shopana-storefront-visitor-id');
  return guest;
}
