/**
 * The server entry of a storefront under React Router: streams the document as React renders
 * it, and waits for all of it for crawlers and `HEAD` requests, so they get complete pages and
 * the status and redirect the render decided.
 */
import { Transform } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { createElement, Fragment } from 'react';
import {
  renderToPipeableStream,
  renderToStaticMarkup,
  type RenderToPipeableStreamOptions,
} from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';
import {
  getServerRequestScope,
  type ServerRequestScope,
} from '@shopana/storefront-sdk/server/requestScope';
import { apolloStateScript } from './apollo-ssr-state';
import { hydratedPageOf, hydratedPageScript } from './hydration';
import { ServerRequestScopeProvider } from '@shopana/storefront-sdk/core/ServerRequestScope';
import { isNotFoundSignal } from './not-found-response';
import { serverInsertedHTMLCallbacks } from './server-inserted-html';
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

/** Where the document ends: the Apollo state and the hydrated page go in before it. */
const BODY_END = Buffer.from('</body>');

/** Where the head ends: HTML the render asks for with the shell goes in before it. */
const HEAD_END = Buffer.from('</head>');

/** The HTML the render's `useServerInsertedHTML` callbacks return now. */
function insertedHTML(scope: ServerRequestScope): string {
  const callbacks = serverInsertedHTMLCallbacks(scope);
  if (callbacks.length === 0) return '';
  return renderToStaticMarkup(
    createElement(Fragment, null, ...callbacks.map((callback) => callback()))
  );
}

/** How many bytes at the end of `data` are the start of `</body>`, cut off by the chunk. */
function bodyEndPrefixLength(data: Buffer): number {
  for (
    let length = Math.min(BODY_END.length - 1, data.length);
    length > 0;
    length--
  ) {
    if (
      data.subarray(data.length - length).equals(BODY_END.subarray(0, length))
    ) {
      return length;
    }
  }
  return 0;
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
): Promise<Response> {
  // A HEAD request renders too, without a body: its status and redirect are those of GET.
  const head = request.method.toUpperCase() === 'HEAD';
  // The request's scope, kept for the end of the stream: its Apollo cache goes to the browser.
  const scope = getServerRequestScope();

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
      <ServerRequestScopeProvider scope={scope ?? null}>
        <ServerRouter context={routerContext} url={request.url} />
      </ServerRequestScopeProvider>,
      {
        // A Suspense boundary whose content is ready goes out in place, whatever its size:
        // by default React sends the fallback of a large one first and its content later in
        // the stream, so a page in a boundary (a mobile app screen) would paint its skeleton
        // or nothing first. Boundaries still waiting for data stream as before.
        progressiveChunkSize: Number.POSITIVE_INFINITY,
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

          // Once React is done, the cache the app rendered with (the server render's queries
          // included) and the page it rendered go in before `</body>`, for the browser to
          // hydrate from (the client entry loads the page's code first). Held back
          // meanwhile: `</body>` and what follows it, or the end of a chunk that may begin it
          // (the tag can be split between two chunks).
          let closing: Buffer | null = null;
          let partial: Buffer | null = null;
          // React writes each flush of its own in one go: what arrives within a tick is a
          // whole part of the document, and the HTML the render asks for goes in ahead of it
          // (into `<head>` until it is sent), never inside a tag.
          let queued: Buffer[] = [];
          let batch: ReturnType<typeof setImmediate> | undefined;
          let headSent = false;
          let headHTML = '';
          const send = (stream: Transform, chunk: Buffer) => {
            // More document after `</body>`: the state goes at its very end instead.
            if (closing) {
              stream.push(closing);
              closing = null;
            }
            const data = partial ? Buffer.concat([partial, chunk]) : chunk;
            partial = null;
            const end = data.lastIndexOf(BODY_END);
            let out: Buffer;
            if (end === -1) {
              const held = bodyEndPrefixLength(data);
              if (held > 0) partial = data.subarray(data.length - held);
              out = data.subarray(0, data.length - held);
            } else {
              closing = data.subarray(end);
              out = data.subarray(0, end);
            }
            if (out.length > 0) stream.push(out);
          };
          const sendBatch = (stream: Transform) => {
            batch = undefined;
            if (queued.length === 0) return;
            let data = Buffer.concat(queued);
            queued = [];
            const html = scope ? insertedHTML(scope) : '';
            if (headSent) {
              if (html) data = Buffer.concat([Buffer.from(html), data]);
            } else {
              headHTML += html;
              const headEnd = data.indexOf(HEAD_END);
              if (headEnd !== -1) {
                headSent = true;
                data = Buffer.concat([
                  data.subarray(0, headEnd),
                  Buffer.from(headHTML),
                  data.subarray(headEnd),
                ]);
                headHTML = '';
              }
            }
            send(stream, data);
          };
          const body = new Transform({
            transform(chunk: Buffer, _encoding, callback) {
              queued.push(chunk);
              batch ??= setImmediate(() => sendBatch(this));
              callback();
            },
            flush(callback) {
              stopTimeout();
              if (batch) clearImmediate(batch);
              sendBatch(this);
              const { loaderData, errors } = routerContext.staticHandlerContext;
              const state =
                (scope ? apolloStateScript(scope) : '') +
                hydratedPageScript(hydratedPageOf(loaderData, errors));
              if (closing) {
                if (state) this.push(state);
                callback(null, closing);
                return;
              }
              if (partial) this.push(partial);
              callback(null, state || undefined);
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
