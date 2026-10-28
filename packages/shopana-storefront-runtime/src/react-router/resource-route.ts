import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

type RouteHandler = (
  request: Request,
  context: { params: Promise<{ action?: string | string[] }> }
) => Promise<Response>;

/** A resource route over the `GET`/`POST` handlers of an `/auth/[action]` route. */
export function createAuthResourceRoute(handlers: {
  GET: RouteHandler;
  POST: RouteHandler;
}) {
  const context = (params: LoaderFunctionArgs['params']) => ({
    params: Promise.resolve({ action: params.action }),
  });
  return {
    loader: ({ request, params }: LoaderFunctionArgs) =>
      handlers.GET(request, context(params)),
    action: ({ request, params }: ActionFunctionArgs) =>
      request.method === 'POST'
        ? handlers.POST(request, context(params))
        : new Response(null, { status: 405, headers: { Allow: 'GET, POST' } }),
  };
}
