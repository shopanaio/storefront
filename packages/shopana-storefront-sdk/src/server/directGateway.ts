import { directGatewayUrl } from '../graphql/apollo/serverEndpoint';
import { endUserIp } from '../modules/session/server';
import type { ServerRequestHeaders } from './requestScope';

/**
 * Stands where the proxy next to the gateway writes its address in `X-Forwarded-For`. Not an
 * address: a gateway counting other hops than the two below reads no buyer IP, never a wrong one.
 */
const DIRECT_GATEWAY_HOP = 'storefront-server';

/**
 * What a request past the CDN and the ingress tells the gateway about the visitor. The gateway
 * takes the buyer IP two hops from the right (Cloudflare and Traefik), so the chain has the form
 * these proxies give it. The address is the one the proxies of this server wrote, by
 * `STOREFRONT_TRUSTED_PROXY_HOPS`: entries a client put into its header never get through.
 */
export function directGatewayHeaders(
  headers: ServerRequestHeaders
): Record<string, string> | undefined {
  if (!directGatewayUrl()) return undefined;
  const result: Record<string, string> = {};
  const address = endUserIp(
    { headers },
    Number(process.env.STOREFRONT_TRUSTED_PROXY_HOPS?.trim() || 1)
  );
  if (address) result['x-forwarded-for'] = `${address}, ${DIRECT_GATEWAY_HOP}`;
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
