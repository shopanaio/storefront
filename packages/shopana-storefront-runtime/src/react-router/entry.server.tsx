/**
 * The server entry of a storefront under React Router: streams the document as React renders
 * it, and waits for all of it for crawlers, so they read complete pages.
 */
import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import {
  renderToPipeableStream,
  type RenderToPipeableStreamOptions,
} from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';
import { readRenderRedirect, REDIRECT_STATUSES } from './render-redirect';

/** How long the server streams pending Suspense content before it gives up on it. */
export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
): Promise<Response> | Response {
  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get('user-agent');
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? 'onAllReady'
        : 'onShellReady';

    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000
    );

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          // A `redirect()` the render ran into before anything was sent: an HTTP redirect.
          const redirect = REDIRECT_STATUSES.has(responseStatusCode)
            ? readRenderRedirect()
            : null;
          if (redirect) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
            abort();
            responseHeaders.set('Location', redirect.location);
            resolve(
              new Response(null, {
                status: redirect.status,
                headers: responseHeaders,
              })
            );
            return;
          }
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          responseHeaders.set('Content-Type', 'text/html');
          pipe(body);
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Errors of the shell reject above and are logged by React Router.
          if (shellRendered) console.error(error);
        },
      }
    );
  });
}
