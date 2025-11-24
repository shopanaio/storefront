'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { logError } from '@shopana/storefront-sdk';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    logError('App route error', {
      error,
      boundary: 'global',
    });
  }, [error]);

  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
