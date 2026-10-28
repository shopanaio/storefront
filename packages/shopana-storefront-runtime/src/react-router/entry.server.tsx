/**
 * The server entry of a storefront under React Router: streams the document as React renders
 * it, and waits for all of it for crawlers and `HEAD` requests, so they get complete pages and
 * the status and redirect the render decided.
 */
import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import {
  renderToPipeableStream,
  type RenderToPipeableStreamOptions,
} from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';
import { isNotFoundSignal } from './not-found-response';
import {
  readRenderRedirect,
  readRenderStatus,
  recordRenderStatus,
  REDIRECT_STATUSES,
} from './render-status';

/** How long the server streams pending Suspense content before it gives up on it. */
export const streamTimeout = 5_000;

/** Server errors are logged, but not a page found missing: it is answered with a 404. */
export function handleError(error: unknown, { request }: { request: Request }) {
  if (request.signal.aborted || isNotFoundSignal(error)) return;
  console.error(error);
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
): Promise<Response> {
  // A HEAD request renders too, without a body: its status and redirect are those of GET.
  const head = request.method.toUpperCase() === 'HEAD';

  return new Promise((resolve, reject) => {
    let responded = false;
    let status = responseStatusCode;
    const userAgent = request.headers.get('user-agent');
    const readyOption: keyof RenderToPipeableStreamOptions =
      head || (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? 'onAllReady'
        : 'onShellReady';

    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000
    );
    const stopTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    };

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          responded = true;
          // A `redirect()` the render ran into before anything was sent: an HTTP redirect.
          const redirect = REDIRECT_STATUSES.has(responseStatusCode)
            ? readRenderRedirect()
            : null;
          if (redirect) responseHeaders.set('Location', redirect.location);
          // A page a section found missing answers 404, as the not-found page it shows.
          status = redirect?.status ?? readRenderStatus() ?? status;

          if (redirect || head) {
            stopTimeout();
            abort();
            resolve(new Response(null, { status, headers: responseHeaders }));
            return;
          }

          const body = new PassThrough({
            final(callback) {
              stopTimeout();
              callback();
            },
          });
          responseHeaders.set('Content-Type', 'text/html');
          pipe(body);
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status,
            })
          );
        },
        onShellError(error: unknown) {
          // React Router renders the error again with it hidden: the 404 stays known.
          if (isNotFoundSignal(error)) recordRenderStatus(404);
          reject(error);
        },
        onError(error: unknown) {
          // An error in content rendered before the response (all of it for crawlers and HEAD)
          // sets its status; after that the status is sent, and the browser renders the error.
          if (!responded) {
            status = isNotFoundSignal(error) ? 404 : 500;
          } else if (!isNotFoundSignal(error)) {
            // Errors of the shell reject above and are logged by React Router.
            console.error(error);
          }
        },
      }
    );
  });
}
