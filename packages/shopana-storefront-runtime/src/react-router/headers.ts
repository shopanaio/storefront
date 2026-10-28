import { getServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';
import type {
  ReadonlyHeaders,
  ReadonlyRequestCookies,
  RequestCookie,
} from '../core/facade-types';
import type { SDKRequestContext } from '../core/request-context';

export type { SDKRequestContext };

function requireScope() {
  const scope = getServerRequestScope();
  if (!scope) {
    throw new Error(
      'The request is read on the server inside a request: in a loader, a middleware or the server render'
    );
  }
  return scope;
}

/** The address of the current server request, as the runtime middleware saw it. */
export async function getRequestContext(): Promise<SDKRequestContext> {
  const { url, headers: requestHeaders } = requireScope();
  return {
    url: url.href,
    pathname: url.pathname,
    search: url.search,
    host: requestHeaders.get('host') || url.host,
    searchParams: new URLSearchParams(url.search),
  };
}

/** The headers of the current server request, with the storefront locale header. */
export async function headers(): Promise<ReadonlyHeaders> {
  return new Headers(requireScope().headers as Headers);
}

/** The cookies of the current server request. */
export async function cookies(): Promise<ReadonlyRequestCookies> {
  const list: RequestCookie[] = [];
  for (const part of (requireScope().headers.get('cookie') ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    const raw = part.slice(separator + 1).trim();
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      // A value that is not URI-encoded is read as it is.
    }
    if (name) list.push({ name, value });
  }
  return {
    get: (name) => list.find((cookie) => cookie.name === name),
    getAll: () => [...list],
    has: (name) => list.some((cookie) => cookie.name === name),
  };
}
