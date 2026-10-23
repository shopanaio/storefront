'use client';

import { useCallback, useState } from 'react';

export function useAuthAction<TArgs extends readonly unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const execute = useCallback(
    async (...args: TArgs) => {
      setIsPending(true);
      setError(null);
      try {
        return await action(...args);
      } catch (value) {
        const nextError =
          value instanceof Error ? value : new Error(String(value));
        setError(nextError);
        throw nextError;
      } finally {
        setIsPending(false);
      }
    },
    [action]
  );
  return { execute, isPending, error };
}
