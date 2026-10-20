import { useMutation } from '@shopana/storefront-sdk/graphql/apollo';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
import {
  followSuperseded,
  isMutationSuperseded,
} from '@shopana/storefront-sdk/modules/cart/core/utils/mutationQueue';
import { clearSaveError, reportSaveError } from '#checkout/state/banners/bannerStore';
import type { OperationVariables, TypedDocumentNode } from '@apollo/client';
import { useCallback, useRef, useEffect } from 'react';
import { debounce, type DebouncedFunc } from 'lodash';
import {
  emitCheckoutEvent,
  CheckoutEvent,
  OperationKey,
} from '#checkout/state/checkoutBus';
import { closedCheckoutCode } from '#checkout/state/closedCheckout';
import type { SectionId } from '#checkout/state/interface';

function getCheckoutUserErrors(response: object): unknown[] {
  for (const payload of Object.values(response)) {
    if (!payload || typeof payload !== 'object') continue;
    const errors = Reflect.get(payload, 'errors');
    if (Array.isArray(errors) && errors.length > 0) {
      return errors;
    }
  }

  return [];
}

export interface CommitOptions {
  /**
   * Resource the mutation writes, e.g. `payment` or `delivery:<groupId>`. Mutations of one
   * resource waiting in the queue are merged into the latest.
   */
  key?: string;
  /**
   * What a call replaced by a newer write of its resource gets: `follow` (default) settles as
   * that newer write, `reject` rejects with `MutationSupersededError` at once, for a caller
   * that must know its own value never went.
   */
  superseded?: 'follow' | 'reject';
}

/**
 * Options for checkout operation
 */
export interface CheckoutOperationOptions {
  /**
   * Report a failure in the checkout banner, until the operation succeeds again. Off for
   * operations whose section shows the failure itself.
   * @default true
   */
  reportError?: boolean;
  /**
   * Message of the reported failure
   */
  errorMessage?: string;
  /**
   * Reject when the payload carries user errors. Disable for operations whose payload stays
   * meaningful next to its errors (placeOrder returns the placement together with them).
   * @default true
   */
  rejectOnUserErrors?: boolean;
  /**
   * Debounce delay in milliseconds
   * @default 150
   */
  debounceMs?: number;
  /**
   * Operation key for tracking inflight state
   */
  operationKey?: OperationKey;
  /**
   * Associated section ID for the operation
   */
  sectionId?: SectionId;
  /**
   * Callback fired when operation starts (in addition to event emission)
   */
  onStart?: () => void;
  /**
   * Callback fired when operation ends (in addition to event emission)
   */
  onEnd?: () => void;
}

/**
 * Hook that wraps useMutation with inflight management, debouncing, and lifecycle hooks.
 * Combines functionality of usePromisifiedMutation and InflightManager.
 *
 * Features:
 * - Promisified mutation API
 * - One queue with the cart for every write, in order, merging waiting writes of a resource
 * - Debounced execution to prevent excessive calls
 * - In-flight guard with race protection via timestamps
 * - Lifecycle hooks (onStart, onEnd) for UI busy state
 * - Optional failure report in the checkout banner
 *
 * @template TMutation - The mutation type
 * @param mutation - The GraphQL mutation
 * @param options - Configuration options
 * @returns Object with commit function and isInFlight state
 *
 * @example
 * ```ts
 * const { commit, isInFlight } = useCheckoutOperation(
 *   myMutation,
 *   {
 *     errorMessage: 'Failed to save',
 *     debounceMs: 250,
 *     onStart: () => console.log('Starting...'),
 *     onEnd: () => console.log('Done')
 *   }
 * );
 *
 * await commit({ variables: { input } });
 * ```
 */
export function useCheckoutOperation<
  TData extends object,
  TVariables extends OperationVariables,
>(
  mutation: TypedDocumentNode<TData, TVariables>,
  options: CheckoutOperationOptions = {}
) {
  const {
    reportError = true,
    errorMessage = 'Operation failed',
    rejectOnUserErrors = true,
    debounceMs = 150,
    operationKey,
    sectionId,
    onStart,
    onEnd,
  } = options;

  const [commitMutation, isInFlight] = useMutation(mutation);
  // Reported failures are kept per operation; a later success of it clears its failure.
  const errorKey = operationKey ?? errorMessage;

  // Track inflight timestamp for race protection
  const inflightTimestampRef = useRef<number | null>(null);
  // Store pending function for debounced execution
  const pendingFnRef = useRef<(() => void) | null>(null);

  // Create debounced executor
  const debouncedExecutorRef = useRef<DebouncedFunc<() => void> | undefined>(
    undefined
  );

  useEffect(() => {
    // Initialize debounced executor
    debouncedExecutorRef.current = debounce(
      () => {
        const pendingFn = pendingFnRef.current;
        if (pendingFn) {
          pendingFn();
          pendingFnRef.current = null;
        }
      },
      debounceMs,
      { leading: false, trailing: true }
    );

    // Cleanup: cancel pending debounced calls
    return () => {
      debouncedExecutorRef.current?.cancel();
      pendingFnRef.current = null;
      inflightTimestampRef.current = null;
    };
  }, [debounceMs]);

  /**
   * Execute operation with inflight guard and lifecycle callbacks
   */
  const runWithInflight = useCallback(
    async (operation: () => Promise<TData>): Promise<TData> => {
      const ts = Date.now();
      inflightTimestampRef.current = ts;
      // Every emitted OperationStart must be paired with exactly one OperationEnd,
      // otherwise the active operations counter never returns to zero.
      let started = false;

      try {
        // Emit OperationStart event
        if (operationKey) {
          started = true;
          await emitCheckoutEvent(CheckoutEvent.OperationStart, {
            key: operationKey,
            sectionId,
          });
        }
        onStart?.();

        const result = await operation();
        return result;
      } catch (error) {
        // Emit OperationError event; a write replaced by a newer one did not fail.
        if (operationKey && !isMutationSuperseded(error)) {
          const anyErr = error as
            | { message?: unknown; code?: unknown }
            | null
            | undefined;
          const message =
            typeof anyErr?.message === 'string' ? anyErr?.message : undefined;
          const code =
            typeof anyErr?.code === 'string' ? anyErr?.code : undefined;

          await emitCheckoutEvent(CheckoutEvent.OperationError, {
            key: operationKey,
            sectionId,
            message,
            code,
            error,
          });
        }
        throw error;
      } finally {
        if (started && operationKey) {
          await emitCheckoutEvent(CheckoutEvent.OperationEnd, {
            key: operationKey,
            sectionId,
          });
        }

        // Only clear inflight and call onEnd if this is still the latest operation
        if (inflightTimestampRef.current === ts) {
          inflightTimestampRef.current = null;
          onEnd?.();
        }
      }
    },
    [operationKey, sectionId, onStart, onEnd]
  );

  /**
   * Commit mutation with promise API
   */
  const commitPromise = useCallback(
    (variables: TVariables): Promise<TData> => {
      const fail = () => {
        if (reportError) {
          reportSaveError({
            key: errorKey,
            message: errorMessage,
            sectionId: sectionId ?? null,
          });
        }
      };
      return new Promise((resolve, reject) => {
        commitMutation({
          variables,
          onCompleted: (response, errors) => {
            if (errors && errors.length) {
              fail();
              return reject(errors);
            }
            const userErrors = rejectOnUserErrors
              ? getCheckoutUserErrors(response)
              : [];
            if (userErrors.length > 0) {
              const closed = closedCheckoutCode(userErrors);
              if (closed) {
                // A closed checkout is handled once for the whole checkout, not per mutation.
                void emitCheckoutEvent(CheckoutEvent.CheckoutClosed, {
                  code: closed,
                });
              } else {
                fail();
              }
              return reject(userErrors);
            }
            if (reportError) clearSaveError(errorKey);
            resolve(response);
          },
          onError: (error) => {
            fail();
            reject(error);
          },
        }).then((data) => {
          // A response with neither data nor an error calls no callback: settle the promise
          // anyway, or the operation (and `placeOrder`) would stay in flight forever.
          // After a callback already settled it this has no effect.
          if (!data) {
            reject(new Error('The mutation returned no data.'));
          }
        });
      });
    },
    [commitMutation, reportError, errorKey, errorMessage, sectionId, rejectOnUserErrors]
  );

  const { enqueueMutation } = useCartSetters();

  /**
   * Sends the mutation after every write of the cart and the checkout queued before it
   * (R-6). A mutation with the same `key` still waiting is replaced by this one: only the
   * latest value of a resource is sent (see `CommitOptions.superseded`).
   */
  const commit = useCallback(
    (
      variables: TVariables,
      { key, superseded = 'follow' }: CommitOptions = {}
    ): Promise<TData> => {
      // Joins the queue right away, so writes keep the order they were asked in.
      const enqueued = enqueueMutation(() => commitPromise(variables), { key });
      const queued =
        superseded === 'follow' ? followSuperseded(enqueued) : enqueued;
      queued.catch(() => undefined);
      return runWithInflight(() => queued);
    },
    [runWithInflight, commitPromise, enqueueMutation]
  );

  /**
   * Sends the mutation at once, outside the queue. Only for a task that already runs in the
   * queue and sends several mutations one after the other.
   */
  const send = useCallback(
    (variables: TVariables): Promise<TData> =>
      runWithInflight(() => commitPromise(variables)),
    [runWithInflight, commitPromise]
  );

  /**
   * Scheduled commit with debouncing
   */
  const commitScheduled = useCallback(
    (variables: TVariables): void => {
      pendingFnRef.current = () => {
        void commit(variables);
      };
      debouncedExecutorRef.current?.();
    },
    [commit]
  );

  return {
    commit,
    send,
    commitScheduled,
    isInFlight,
  };
}
