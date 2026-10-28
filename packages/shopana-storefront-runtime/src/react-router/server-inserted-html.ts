import type { ReactNode } from 'react';
import { useServerRequestScope } from '@shopana/storefront-sdk/core/ServerRequestScope';
import type { ServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';

type InsertedHTMLCallback = () => ReactNode;

/** Where the request keeps the callbacks its render registered. */
const CALLBACKS = Symbol('server-inserted-html');

/** The callbacks the request's render registered, for the server entry to ask. */
export function serverInsertedHTMLCallbacks(
  scope: ServerRequestScope
): InsertedHTMLCallback[] {
  let callbacks = scope.values.get(CALLBACKS) as
    | InsertedHTMLCallback[]
    | undefined;
  if (!callbacks) {
    callbacks = [];
    scope.values.set(CALLBACKS, callbacks);
  }
  return callbacks;
}

/**
 * Server only: `callback` is asked for HTML each time the server sends a part of the stream,
 * and what it returns goes out right before that part: into `<head>` with the shell, then
 * ahead of each Suspense boundary streamed later. Css-in-js libraries send the styles the
 * part's components inserted this way. Does nothing in the browser.
 */
export function useServerInsertedHTML(callback: InsertedHTMLCallback): void {
  const scope = useServerRequestScope();
  if (scope) serverInsertedHTMLCallbacks(scope).push(callback);
}
