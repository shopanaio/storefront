import { directGatewayUrl } from '../graphql/apollo/serverEndpoint';
import type { ServerRequestHeaders } from './requestScope';

/** The buyer address Cloudflare sets on every request it proxies; a client cannot set it. */
const CF_CONNECTING_IP = 'cf-connecting-ip';

/**
 * What a request past the CDN and the ingress tells the gateway about the visitor. The gateway
 * takes the buyer IP of a public request from `CF-Connecting-IP` only and reads no
 * `X-Forwarded-For`: this server passes on the header Cloudflare set on the request it serves.
 * Without it (a local run, no Cloudflare in front) the gateway gets no address, never a wrong one.
 */
export function directGatewayHeaders(
  headers: ServerRequestHeaders
): Record<string, string> | undefined {
  if (!directGatewayUrl()) return undefined;
  const result: Record<string, string> = {};
  const address = headers.get(CF_CONNECTING_IP)?.trim();
  if (address) result[CF_CONNECTING_IP] = address;
  const userAgent = headers.get('user-agent');
  if (userAgent) result['user-agent'] = userAgent;
  return result;
}

/** The header the gateway knows a trusted server of the store by (the static site builder). */
export const STOREFRONT_PRIVATE_TOKEN_HEADER =
  'shopana-storefront-private-token';

/**
 * `STOREFRONT_PRIVATE_TOKEN`, the private storefront token of a server the gateway should not
 * take for a browser (its limits, its antifraud): set for the static site builder only, never
 * for a server buyers reach.
 */
export function privateTokenHeaders(): Record<string, string> | undefined {
  const token = process.env.STOREFRONT_PRIVATE_TOKEN?.trim();
  return token ? { [STOREFRONT_PRIVATE_TOKEN_HEADER]: token } : undefined;
}
