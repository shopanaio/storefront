import { cache } from 'react';

/** The part of the request headers server code reads. */
export interface ServerRequestHeaders {
  get(name: string): string | null;
}

/**
 * The server request a framework without request-bound APIs (React Router) runs its loaders
 * and render in. Next.js has its own (`next/headers`, React `cache`), used when no scope is
 * active.
 */
export interface ServerRequestScope {
  /** Normalized URL of the request: what the visitor asked for, framework suffixes removed. */
  readonly url: URL;
  /** Request headers after the runtime middleware, with the storefront locale header. */
  readonly headers: ServerRequestHeaders;
  /** Values kept for this request only (see `cacheForRequest`). */
  readonly values: Map<unknown, unknown>;
}

/** What keeps the scope of the request running now: an `AsyncLocalStorage` on Node. */
export interface ServerRequestStorage {
  getStore(): ServerRequestScope | undefined;
}

let storage: ServerRequestStorage | null = null;

/**
 * Set once by a runtime that runs every server request inside a scope. The storage comes from
 * the runtime so that this module imports no Node built-in and stays safe in browser bundles.
 */
export function provideServerRequestStorage(value: ServerRequestStorage): void {
  storage = value;
}

export function createServerRequestScope(
  url: URL,
  headers: ServerRequestHeaders
): ServerRequestScope {
  return { url, headers, values: new Map() };
}

/** The scope of the request running now, or undefined (browser, Next.js, outside a request). */
export function getServerRequestScope(): ServerRequestScope | undefined {
  return storage?.getStore();
}

/** Headers of the current server request: of the scope, or Next.js's `headers()`. */
export async function readServerRequestHeaders(): Promise<ServerRequestHeaders> {
  const scope = getServerRequestScope();
  if (scope) return scope.headers;
  const { headers } = await import('next/headers');
  return headers();
}

/**
 * `fn` computed once per server request for the same key: in the request scope when one is
 * active, through React `cache` otherwise (Next.js server components).
 */
export function cacheForRequest<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  key: (...args: TArgs) => string
): (...args: TArgs) => TResult {
  const cachedByReact = cache((cacheKey: string, ...args: TArgs) => {
    void cacheKey;
    return fn(...args);
  });

  return (...args: TArgs) => {
    const cacheKey = key(...args);
    const scope = getServerRequestScope();
    if (!scope) return cachedByReact(cacheKey, ...args);

    let results = scope.values.get(cachedByReact) as
      | Map<string, TResult>
      | undefined;
    if (!results) {
      results = new Map();
      scope.values.set(cachedByReact, results);
    }
    if (!results.has(cacheKey)) results.set(cacheKey, fn(...args));
    return results.get(cacheKey) as TResult;
  };
}
