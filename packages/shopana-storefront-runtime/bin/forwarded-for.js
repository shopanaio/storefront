/**
 * Preloaded into the React Router dev server and `react-router-serve`: a request that reached
 * the storefront directly, with no proxy in front, gets `X-Forwarded-For` from its connection,
 * as Next.js sets it. The customer session handlers send that buyer address to IAM. A request
 * a proxy forwarded keeps the header the proxies wrote (`STOREFRONT_TRUSTED_PROXY_HOPS`).
 *
 * The patch reaches every HTTP server of the process, not only the app's: the dev server's
 * own (Vite, its HMR socket) get the header too. It only adds a header the request lacked.
 */
import http from 'node:http';
import https from 'node:https';

/** The events a server hands a request to its handler with (`Expect` headers included). */
const REQUEST_EVENTS = new Set(['request', 'checkContinue', 'checkExpectation']);

// `https.Server` is a TLS server, not an `http.Server`: both are patched.
for (const Server of [http.Server, https.Server]) {
  const emit = Server.prototype.emit;
  Server.prototype.emit = function emitWithForwardedFor(event, request, ...rest) {
    if (
      REQUEST_EVENTS.has(event) &&
      !request.headers['x-forwarded-for'] &&
      request.socket?.remoteAddress
    ) {
      request.headers['x-forwarded-for'] = request.socket.remoteAddress;
    }
    return emit.call(this, event, request, ...rest);
  };
}
