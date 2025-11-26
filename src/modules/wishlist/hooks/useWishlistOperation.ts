'use client';

import { useCallback, useEffect, useRef } from 'react';
import debounce, { DebouncedFunc } from 'lodash/debounce';
import { toast } from '@src/ui-kit/Toast/Toast';
import {
  emitWishlistEvent,
  WishlistEvent,
  WishlistOperationKey,
} from '@src/modules/wishlist/state/wishlistBus';
import { WishlistSectionId } from '@src/modules/wishlist/types';

interface WishlistOperationOptions {
  operationKey: WishlistOperationKey;
  sectionId?: WishlistSectionId;
  debounceMs?: number;
  errorMessage?: string;
  showErrorToast?: boolean;
}

/**
 * Wraps local wishlist mutations with consistent lifecycle events.
 */
export const useWishlistOperation = ({
  operationKey,
  sectionId,
  debounceMs = 120,
  errorMessage = 'Wishlist operation failed',
  showErrorToast = true,
}: WishlistOperationOptions) => {
  const pendingOperation = useRef<(() => Promise<void> | void) | null>(null);
  const executorRef = useRef<DebouncedFunc<() => void>>();

  useEffect(() => {
    executorRef.current = debounce(() => {
      if (!pendingOperation.current) {
        return;
      }
      void run(pendingOperation.current);
      pendingOperation.current = null;
    }, debounceMs);

    return () => {
      executorRef.current?.cancel();
      pendingOperation.current = null;
    };
  }, [debounceMs]);

  const run = useCallback(
    async <T>(operation: () => Promise<T> | T): Promise<T> => {
      await emitWishlistEvent(WishlistEvent.OperationStart, {
        key: operationKey,
        sectionId,
      });

      try {
        const result = await operation();
        await emitWishlistEvent(WishlistEvent.OperationEnd, {
          key: operationKey,
          sectionId,
        });
        return result;
      } catch (error) {
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        await emitWishlistEvent(WishlistEvent.OperationError, {
          key: operationKey,
          sectionId,
          message:
            error instanceof Error ? error.message : errorMessage,
          error,
        }) as unknown as T;
        throw error;
      }
    },
    [errorMessage, operationKey, sectionId, showErrorToast]
  );

  const runScheduled = useCallback(
    (operation: () => Promise<void> | void) => {
      pendingOperation.current = operation;
      executorRef.current?.();
    },
    []
  );

  return { run, runScheduled };
};
