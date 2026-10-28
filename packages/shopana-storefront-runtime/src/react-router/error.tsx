'use client';

import type { ComponentType } from 'react';
import {
  isRouteErrorResponse,
  Navigate,
  useRevalidator,
  useRouteError,
} from 'react-router';

/** The theme's error page (`src/runtime/error.tsx`), with the props of Next.js `error.tsx`. */
export type RuntimeErrorPage = ComponentType<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/** A `redirect()` thrown while rendering: the browser follows it. */
export function getThrownRedirect(error: unknown): string | null {
  if (
    error instanceof Response &&
    REDIRECT_STATUSES.has(error.status) &&
    error.headers.has('Location')
  ) {
    return error.headers.get('Location');
  }
  return null;
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
  const redirectTo = getThrownRedirect(error);
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return (
    <ErrorPage
      error={toError(error)}
      reset={() => void revalidator.revalidate()}
    />
  );
}
