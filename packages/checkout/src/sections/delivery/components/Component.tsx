'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { ProviderRenderer } from '#checkout/infra/ProviderRenderer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  DeliveryFormData,
  DeliveryProviderMethodsRecord,
  DeliveryMethod,
} from '../types';
import {
  ProviderModuleType,
  type ProviderMethod,
} from '#checkout/vendors/types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { validateCustomerInput } from '#checkout/utils/jsonSchema';
import {
  addressScope,
  readCustomerInputs,
  useCustomerInputStore,
} from '../customerInputStorage';
import { definitiveRejection } from '../saveError';
import { closedCheckoutCode } from '#checkout/state/closedCheckout';

/** Pause in typing after which an edited customer input is saved. */
const SAVE_DELAY_MS = 600;
/** Retries of a failed save: 2 s, 4 s, 8 s … up to 30 s, until it succeeds. */
const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 30_000;

/** Input sent to the API: only one that satisfies the option's contract. */
const apiCustomerInput = (method: DeliveryMethod, input: unknown): object | undefined =>
  typeof input === 'object' &&
  input !== null &&
  validateCustomerInput(method.customerInputContract, input).length === 0
    ? input
    : undefined;

const sentKey = (scope: string, handle: string) => `${scope}\n${handle}`;

/**
 * Whether an input still has to be saved. Normally that is an input edited since the API
 * accepted one. For the option the API reset it is any input other than the one refused.
 */
const needsSave = (
  synced: boolean | undefined,
  key: string,
  reselecting: boolean,
  rejectedKey: string | null
) => (reselecting ? key !== rejectedKey : synced === false);

/**
 * View component for the delivery section.
 *
 * Pure controlled UI component that renders the delivery form.
 * Manages local state for optimistic UI updates while API requests are in progress.
 */
export interface DeliverySectionViewProps {
  /** Current form data */
  data: DeliveryFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const DeliverySectionView = ({ data }: DeliverySectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { selectDeliveryMethod, updateShippingMethod } = useCheckoutApi();
  const remember = useCustomerInputStore((state) => state.remember);
  const markSynced = useCustomerInputStore((state) => state.markSynced);
  // Only a single group is rendered for now; options already carry their stored input.
  const [, deliveryGroup] = Object.entries(data ?? {}).at(0) || [];
  const {
    id: deliveryGroupId,
    selectedDeliveryMethod: serverSelectedMethod,
    deliveryMethods,
    address = null,
    resetReason = null,
    previousOptionHandle = null,
  } = deliveryGroup || {};
  const scope = addressScope(address);

  /**
   * Option whose selection the API reset (the carrier refused the branch, the street or the
   * limits). It stays open with the reason, so the customer can fix the input; a fixed
   * input selects it again.
   */
  const resetMethod =
    !serverSelectedMethod && resetReason
      ? (deliveryMethods?.find((method) => method.handle === previousOptionHandle) ??
        null)
      : null;

  /** Option picked by the customer while the API request is in flight. */
  const [pendingHandle, setPendingHandle] = useState<string | null>(null);
  const selectedHandle =
    pendingHandle ?? serverSelectedMethod?.handle ?? resetMethod?.handle ?? null;
  const selectedMethod = useMemo(
    () =>
      deliveryMethods?.find((method) => method.handle === selectedHandle) ??
      (serverSelectedMethod?.handle === selectedHandle
        ? serverSelectedMethod
        : null),
    [deliveryMethods, selectedHandle, serverSelectedMethod]
  );

  /** Input last sent for each option, by address scope and handle. */
  const [sentInputs, setSentInputs] = useState<Record<string, string>>({});
  const recordSent = useCallback(
    (scope: string, handle: string, input: unknown) =>
      setSentInputs((current) => ({
        ...current,
        [sentKey(scope, handle)]: JSON.stringify(input),
      })),
    []
  );
  /** Input of the reset option the API refused; it is not sent again by itself. */
  const rejectedKey = resetMethod
    ? (sentInputs[sentKey(scope, resetMethod.handle)] ?? null)
    : null;
  const reselecting = !!resetMethod && selectedMethod?.handle === resetMethod.handle;

  /**
   * Delivery mutations run one at a time, in order: a save started earlier can never land
   * after a later save or selection. Each task reads the latest state when it starts.
   */
  const queue = useRef<Promise<void>>(Promise.resolve());
  const enqueue = useCallback((task: () => Promise<void>) => {
    const run = queue.current.then(task);
    queue.current = run.catch(() => {});
    return run;
  }, []);

  /** Latest selection and API, for tasks that start after this render. */
  const latest = useRef({
    deliveryGroupId,
    scope,
    selectedMethod,
    reselecting,
    rejectedKey,
    updateShippingMethod,
  });
  useEffect(() => {
    latest.current = {
      deliveryGroupId,
      scope,
      selectedMethod,
      reselecting,
      rejectedKey,
      updateShippingMethod,
    };
  });

  const handleSelectMethod = useCallback(
    async (method: ProviderMethod) => {
      const fullMethod = deliveryMethods?.find((m) => m.handle === method.handle);

      if (!fullMethod || !deliveryGroupId) {
        console.error('Delivery method or group not found:', method);
        return;
      }

      setPendingHandle(fullMethod.handle);
      try {
        await enqueue(async () => {
          const stored = readCustomerInputs(deliveryGroupId, scope)[fullMethod.handle];
          const customerInput = apiCustomerInput(
            fullMethod,
            stored ? stored.input : fullMethod.data
          );
          if (customerInput !== undefined) {
            recordSent(scope, fullMethod.handle, customerInput);
          }
          await selectDeliveryMethod({
            optionHandle: fullMethod.handle,
            deliveryGroupId,
            customerInput,
          });
          if (customerInput !== undefined) {
            markSynced(deliveryGroupId, scope, fullMethod.handle, customerInput);
          }
        });
      } catch (error) {
        console.error('Failed to select delivery method:', error);
      } finally {
        setPendingHandle(null);
      }
    },
    [
      selectDeliveryMethod,
      deliveryMethods,
      deliveryGroupId,
      scope,
      markSynced,
      recordSent,
      enqueue,
    ]
  );

  /**
   * Customer input of a method (branch, street, building) on every change. It is stored at
   * once as not yet saved, which blocks the order until the API accepts it; the input
   * stays with its own method even when another one is selected meanwhile.
   */
  const handleUpdateMethodData = useCallback(
    (handle: string, input: unknown, view?: unknown) => {
      if (!deliveryGroupId) {
        return;
      }
      remember(
        deliveryGroupId,
        scope,
        handle,
        input === undefined ? undefined : { input, view, synced: false }
      );
    },
    [deliveryGroupId, scope, remember]
  );

  /**
   * Saves the input of the selected method as it is when the save starts. It is marked
   * saved only if it did not change during the request; otherwise a later save follows.
   * For the reset option the save selects it again.
   */
  const saveSelectedInput = useCallback(async () => {
    const {
      deliveryGroupId,
      scope,
      selectedMethod,
      reselecting,
      rejectedKey,
      updateShippingMethod,
    } = latest.current;
    if (!deliveryGroupId || !selectedMethod) {
      return;
    }
    const stored = readCustomerInputs(deliveryGroupId, scope)[selectedMethod.handle];
    const input = apiCustomerInput(
      selectedMethod,
      stored ? stored.input : selectedMethod.data
    );
    if (
      input === undefined ||
      !needsSave(stored?.synced, JSON.stringify(input), reselecting, rejectedKey)
    ) {
      return;
    }
    recordSent(scope, selectedMethod.handle, input);
    await updateShippingMethod({
      optionHandle: selectedMethod.handle,
      deliveryGroupId,
      customerInput: input,
    });
    markSynced(deliveryGroupId, scope, selectedMethod.handle, input);
  }, [markSynced, recordSent]);

  /**
   * Saves the unsaved input of the selected method once typing pauses. Incomplete input
   * is not sent: the section stays invalid until the customer completes it.
   */
  const candidateInput = selectedMethod
    ? apiCustomerInput(selectedMethod, selectedMethod.data)
    : undefined;
  const candidateKey =
    candidateInput === undefined ? null : JSON.stringify(candidateInput);
  const unsavedKey =
    candidateKey !== null &&
    needsSave(selectedMethod?.synced, candidateKey, reselecting, rejectedKey)
      ? candidateKey
      : null;

  /**
   * Failed saves of the current unsaved input. A failure the backend will repeat for this
   * input (`rejected`) stops the retries until the input changes; any other retries later.
   */
  const [failures, setFailures] = useState<{
    key: string;
    count: number;
    rejected: string[] | null;
  } | null>(null);
  const failure = failures?.key === unsavedKey ? failures : null;
  const failureCount = failure?.count ?? 0;
  const rejectedMessages = failure?.rejected ?? null;
  const stopped = rejectedMessages !== null;

  useEffect(() => {
    if (!unsavedKey || pendingHandle || stopped) {
      return;
    }
    const delay =
      failureCount === 0
        ? SAVE_DELAY_MS
        : Math.min(RETRY_BASE_MS * 2 ** (failureCount - 1), RETRY_MAX_MS);
    const timer = setTimeout(() => {
      enqueue(saveSelectedInput).catch((error) => {
        // The input stays unsaved and keeps the order blocked until a save succeeds.
        console.error('Failed to update delivery method data:', error);
        setFailures({
          key: unsavedKey,
          count: failureCount + 1,
          // A closed checkout stops the saves; the checkout itself tells the customer why.
          rejected: closedCheckoutCode(error) ? [] : definitiveRejection(error),
        });
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [unsavedKey, pendingHandle, stopped, failureCount, enqueue, saveSelectedInput]);

  const providerMethodsRecord = useMemo(
    () =>
      (deliveryMethods ?? []).reduce<DeliveryProviderMethodsRecord>(
        (acc, method) => {
          (acc[method.provider] ??= []).push(method);
          return acc;
        },
        {}
      ),
    [deliveryMethods]
  );

  if (!deliveryGroupId || !deliveryMethods?.length) {
    return null;
  }

  return (
    <Flex vertical gap={12} className={styles.container}>
      {resetReason && !serverSelectedMethod && !pendingHandle && (
        <Alert
          type="warning"
          showIcon
          message={resetReason.message}
          description={t(
            resetMethod ? 'delivery-selection-reset-fix' : 'delivery-selection-reset'
          )}
        />
      )}
      {rejectedMessages && rejectedMessages.length > 0 && (
        <Alert
          type="error"
          showIcon
          message={rejectedMessages.join(' ')}
          description={t('delivery-input-rejected')}
        />
      )}
      {failureCount > 0 && !rejectedMessages && (
        <Alert type="warning" showIcon message={t('delivery-input-retrying')} />
      )}
      {Object.entries(providerMethodsRecord).map(([provider, methods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ProviderModuleType.Delivery}
          provider={provider}
          availableMethods={methods}
          selectedMethod={selectedMethod}
          onSelectMethod={handleSelectMethod}
          onUpdateMethodData={handleUpdateMethodData}
          deliveryAddress={address}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySectionView;
