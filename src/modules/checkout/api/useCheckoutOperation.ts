import { useMutation } from 'react-relay';
import { toast } from '@src/components/UI/Toast/Toast';
import { GraphQLTaggedNode, MutationParameters } from 'relay-runtime';
import { useCallback, useRef, useEffect } from 'react';
import { debounce, type DebouncedFunc } from 'lodash';
import {
  emitCheckoutEvent,
  CheckoutEvent,
  OperationKey,
} from '@src/modules/checkout/state/checkoutBus';
import type { SectionId } from '@src/modules/checkout/state/interface';

/**
 * Options for checkout operation
 */
export interface CheckoutOperationOptions {
  /**
   * Show error toast on mutation failure
   * @default true
   */
  showErrorToast?: boolean;
  /**
   * Custom error message to display in toast
   */
  errorMessage?: string;
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
 * - Debounced execution to prevent excessive calls
 * - In-flight guard with race protection via timestamps
 * - Lifecycle hooks (onStart, onEnd) for UI busy state
 * - Optional error toast notifications
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
export function useCheckoutOperation<TMutation extends MutationParameters>(
  mutation: GraphQLTaggedNode,
  options: CheckoutOperationOptions = {}
) {
  const {
    showErrorToast = true,
    errorMessage = 'Operation failed',
    debounceMs = 150,
    operationKey,
    sectionId,
    onStart,
    onEnd,
  } = options;

  const [commitMutation, isInFlight] = useMutation<TMutation>(mutation);

  // Track inflight timestamp for race protection
  const inflightTimestampRef = useRef<number | null>(null);
  // Store pending function for debounced execution
  const pendingFnRef = useRef<(() => void) | null>(null);

  // Create debounced executor
  const debouncedExecutorRef = useRef<DebouncedFunc<() => void> | undefined>(undefined);

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
    async (operation: () => Promise<TMutation['response']>): Promise<TMutation['response']> => {
      const ts = Date.now();
      inflightTimestampRef.current = ts;

      try {
        // Emit OperationStart event
        if (operationKey) {
          await emitCheckoutEvent(CheckoutEvent.OperationStart, {
            key: operationKey,
            sectionId,
          });
        }
        onStart?.();

        const result = await operation();
        return result;
      } catch (error) {
        // Emit OperationError event
        if (operationKey) {
          const anyErr = error as
            | { message?: unknown; code?: unknown }
            | null
            | undefined;
          const message =
            typeof anyErr?.message === 'string' ? anyErr?.message : undefined;
          const code = typeof anyErr?.code === 'string' ? anyErr?.code : undefined;

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
        // Only clear inflight and call onEnd if this is still the latest operation
        if (inflightTimestampRef.current === ts) {
          inflightTimestampRef.current = null;

          // Emit OperationEnd event
          if (operationKey) {
            await emitCheckoutEvent(CheckoutEvent.OperationEnd, {
              key: operationKey,
              sectionId,
            });
          }
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
    (variables: TMutation['variables']): Promise<TMutation['response']> => {
      return new Promise((resolve, reject) => {
        commitMutation({
          variables,
          onCompleted: (response, errors) => {
            if (errors && errors.length) {
              if (showErrorToast) {
                toast.error(errorMessage);
              }
              return reject(errors);
            }
            resolve(response);
          },
          onError: (error) => {
            if (showErrorToast) {
              toast.error(errorMessage);
            }
            reject(error);
          },
        });
      });
    },
    [commitMutation, showErrorToast, errorMessage]
  );

  /**
   * Main commit function with inflight protection
   */
  const commit = useCallback(
    (variables: TMutation['variables']): Promise<TMutation['response']> => {
      return runWithInflight(() => commitPromise(variables));
    },
    [runWithInflight, commitPromise]
  );

  /**
   * Scheduled commit with debouncing
   */
  const commitScheduled = useCallback(
    (variables: TMutation['variables']): void => {
      pendingFnRef.current = () => {
        void commit(variables);
      };
      debouncedExecutorRef.current?.();
    },
    [commit]
  );

  return {
    commit,
    commitScheduled,
    isInFlight,
  };
}
