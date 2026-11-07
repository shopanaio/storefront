/**
 * The request of the static site builder (`@shopana/storefront-sdk/static`): a guest's page
 * rendered whole, for every buyer. The header's value says what to render: `page` the page of
 * the address, `shell` its layout and a skeleton the browser fills in (a cart, an account, a
 * search). Only the builder's own process renders so (its key).
 */
export {
  STATIC_RENDER_HEADER,
  STATIC_RENDER_KEY_HEADER,
  staticRenderHeaders,
  staticRenderMode,
  type StaticRenderMode,
} from '@shopana/storefront-sdk/static';

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
