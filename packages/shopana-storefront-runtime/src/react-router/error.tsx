'use client';

import type { ComponentType } from 'react';
import {
  isRouteErrorResponse,
  Navigate,
  useRevalidator,
  useRouteError,
} from 'react-router';
import {
  readRenderRedirect,
  REDIRECT_STATUSES,
  type RenderRedirect,
} from './render-redirect';

/** The theme's error page (`src/runtime/error.tsx`), with the props of Next.js `error.tsx`. */
export type RuntimeErrorPage = ComponentType<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

/** A `redirect()` thrown while rendering. */
export function getThrownRedirect(error: unknown): RenderRedirect | null {
  if (!(error instanceof Response) || !REDIRECT_STATUSES.has(error.status)) {
    return null;
  }
  const location = error.headers.get('Location');
  return location ? { location, status: error.status } : null;
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (isRouteErrorResponse(error)) {
    return new Error(
      `${error.status} ${error.statusText}`.trim() || 'Request failed'
    );
  }
  return new Error(String(error));
}

/** Renders the theme's error page for the error of the route; `reset` loads its data again. */
export function RouteErrorPage({ ErrorPage }: { ErrorPage: RuntimeErrorPage }) {
  const error = useRouteError();
  const revalidator = useRevalidator();
  // In the browser the thrown response itself. On the server React Router keeps only its
  // status: the entry answers with the redirect `redirect()` kept, and content streamed after
  // the response started refreshes to it, as Next.js does.
  const redirect =
    getThrownRedirect(error) ??
    (isRouteErrorResponse(error) && REDIRECT_STATUSES.has(error.status)
      ? readRenderRedirect()
      : null);
  if (redirect) {
    return (
      <>
        <meta httpEquiv="refresh" content={`0;url=${redirect.location}`} />
        <Navigate to={redirect.location} replace />
      </>
    );
  }

  return (
    <ErrorPage
      error={toError(error)}
      reset={() => void revalidator.revalidate()}
    />
  );
}
