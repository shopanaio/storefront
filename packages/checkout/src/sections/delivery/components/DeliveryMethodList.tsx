'use client';

import { Alert, Flex } from 'antd';
import { useTranslations } from 'next-intl';
import { ProviderRenderer } from '#checkout/infra/ProviderRenderer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  DeliveryAddress,
  DeliveryGroup,
  DeliveryMethod,
  DeliveryProviderMethodsRecord,
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
import {
  commonSelectionKey,
  methodKey,
  methodOfGroup,
  quotedMethod,
} from '../shipments';
import { ShipmentQuote } from './ShipmentQuote';

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

const sentKey = (groupId: string, scope: string, handle: string) =>
  `${groupId}\n${scope}\n${handle}`;

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

/** Option of a group the list selects, with the address scope of its input. */
interface Target {
  group: DeliveryGroup;
  method: DeliveryMethod;
  scope: string;
  /** The API reset this very option in the group; a fixed input selects it again. */
  reselecting: boolean;
}

/** Option the API reset in the group, if any. */
const resetOption = (group: DeliveryGroup): DeliveryMethod | null =>
  !group.selectedDeliveryMethod && group.resetReason
    ? (group.deliveryMethods.find(
        (method) => method.handle === group.previousOptionHandle
      ) ?? null)
    : null;

/**
 * Method the API reset, kept open so the customer can fix its input: every group either
 * has it selected or had it reset.
 */
function resetKeyOf(groups: DeliveryGroup[]): string | null {
  const reset = groups.map(resetOption);
  const first = reset.find((method) => method !== null);
  if (!first) {
    return null;
  }
  const key = methodKey(first);
  return groups.every((group, index) => {
    const method = reset[index] ?? group.selectedDeliveryMethod;
    return method !== null && methodKey(method) === key;
  })
    ? key
    : null;
}

export interface DeliveryMethodListProps {
  /**
   * Groups the list selects for: a method picked here is selected in each of them, with
   * the customer input entered once.
   */
  groups: DeliveryGroup[];
  /** Methods to offer, as options of the first group; each must exist in every group. */
  methods: DeliveryMethod[];
  address: DeliveryAddress | null;
  /**
   * Method to select in every group as soon as the list appears, with the input of the
   * first group that has it: "one method for all shipments" after they differed.
   */
  initialSelectKey?: string | null;
  /** Called when selecting a method in the groups starts and when it ends. */
  onSelectingChange?: (selecting: boolean) => void;
}

/**
 * Delivery methods of one shipment, or the methods shared by several shipments. Saves the
 * selection and the customer input of every group it covers.
 */
export const DeliveryMethodList = ({
  groups,
  methods,
  address,
  initialSelectKey = null,
  onSelectingChange,
}: DeliveryMethodListProps) => {
  const t = useTranslations('Checkout');
  const { selectDeliveryMethod, updateShippingMethod } = useCheckoutApi();
  const remember = useCustomerInputStore((state) => state.remember);
  const markSynced = useCustomerInputStore((state) => state.markSynced);

  const serverKey = useMemo(() => commonSelectionKey(groups), [groups]);
  const resetKey = useMemo(() => (serverKey ? null : resetKeyOf(groups)), [groups, serverKey]);

  /** Method picked by the customer while the API requests are in flight. */
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const selectedKey = pendingKey ?? serverKey ?? resetKey;
  const [lead] = groups;
  const selectedMethod = useMemo(
    () =>
      methods.find((method) => methodKey(method) === selectedKey) ??
      (lead?.selectedDeliveryMethod && methodKey(lead.selectedDeliveryMethod) === selectedKey
        ? lead.selectedDeliveryMethod
        : null),
    [methods, selectedKey, lead]
  );

  const targetsOf = useCallback(
    (key: string | null): Target[] =>
      groups.flatMap((group) => {
        const method = methodOfGroup(group, key);
        if (!method) {
          return [];
        }
        const reset = resetOption(group);
        return [
          {
            group,
            method,
            scope: addressScope(group.address),
            reselecting: reset?.handle === method.handle,
          },
        ];
      }),
    [groups]
  );
  const targets = useMemo(() => targetsOf(selectedKey), [targetsOf, selectedKey]);

  /** Input last sent for each option, by group, address scope and handle. */
  const [sentInputs, setSentInputs] = useState<Record<string, string>>({});
  const recordSent = useCallback(
    (target: Target, input: unknown) =>
      setSentInputs((current) => ({
        ...current,
        [sentKey(target.group.id, target.scope, target.method.handle)]: JSON.stringify(input),
      })),
    []
  );
  /** Input of the reset option the API refused; it is not sent again by itself. */
  const rejectedKeyOf = useCallback(
    (target: Target) =>
      target.reselecting
        ? (sentInputs[sentKey(target.group.id, target.scope, target.method.handle)] ?? null)
        : null,
    [sentInputs]
  );

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
  const latest = useRef({ targets, rejectedKeyOf, updateShippingMethod });
  useEffect(() => {
    latest.current = { targets, rejectedKeyOf, updateShippingMethod };
  });

  /**
   * Selects the method in every group. The input entered for it in the first group that has
   * one goes to all of them: the same method takes the same input in each shipment.
   */
  const handleSelectMethod = useCallback(
    async (method: ProviderMethod) => {
      const key = methodKey(method);
      const selected = targetsOf(key);
      if (!selected.length) {
        console.error('Delivery method or group not found:', method);
        return;
      }

      setPendingKey(key);
      try {
        await enqueue(async () => {
          // The input entered for the method in the first group that has one.
          const storedOf = (target: Target) =>
            readCustomerInputs(target.group.id, target.scope)[target.method.handle];
          const first = selected.find((target) => storedOf(target)) ?? selected[0];
          const leadStored = storedOf(first);
          // The input goes to every group before any request, so the groups never show
          // different input for the same method while the selection is applied.
          const inputs = selected.map((target) => {
            const { group, method, scope } = target;
            const stored = storedOf(target);
            if (target === first || !leadStored) {
              return stored ? stored.input : method.data;
            }
            if (JSON.stringify(stored?.input) !== JSON.stringify(leadStored.input)) {
              remember(group.id, scope, method.handle, { ...leadStored, synced: false });
            }
            return leadStored.input;
          });
          for (const [index, target] of selected.entries()) {
            const { group, method, scope } = target;
            const customerInput = apiCustomerInput(method, inputs[index]);
            if (customerInput !== undefined) {
              recordSent(target, customerInput);
            }
            await selectDeliveryMethod({
              optionHandle: method.handle,
              deliveryGroupId: group.id,
              customerInput,
            });
            if (customerInput !== undefined) {
              markSynced(group.id, scope, method.handle, customerInput);
            }
          }
        });
      } catch (error) {
        console.error('Failed to select delivery method:', error);
      } finally {
        setPendingKey(null);
      }
    },
    [targetsOf, selectDeliveryMethod, remember, markSynced, recordSent, enqueue]
  );

  /** The parent learns when a selection starts and ends, not about the first render. */
  const selecting = pendingKey !== null;
  const wasSelecting = useRef(false);
  useEffect(() => {
    if (wasSelecting.current !== selecting) {
      wasSelecting.current = selecting;
      onSelectingChange?.(selecting);
    }
  }, [selecting, onSelectingChange]);

  /** Selects `initialSelectKey` once, when the list appears. */
  const initialSelectDone = useRef(false);
  useEffect(() => {
    if (initialSelectDone.current || !initialSelectKey) {
      return;
    }
    initialSelectDone.current = true;
    const method = methods.find((candidate) => methodKey(candidate) === initialSelectKey);
    if (method) {
      void handleSelectMethod(method);
    } else {
      onSelectingChange?.(false);
    }
  }, [initialSelectKey, methods, handleSelectMethod, onSelectingChange]);

  /**
   * Customer input of a method (branch, street, building) on every change, for each group
   * the method goes to. It is stored at once as not yet saved, which blocks the order until
   * the API accepts it; the input stays with its own method even when another one is
   * selected meanwhile.
   */
  const handleUpdateMethodData = useCallback(
    (handle: string, input: unknown, view?: unknown) => {
      const method = methods.find((candidate) => candidate.handle === handle);
      if (!method) {
        return;
      }
      for (const { group, method: groupMethod, scope } of targetsOf(methodKey(method))) {
        remember(
          group.id,
          scope,
          groupMethod.handle,
          input === undefined ? undefined : { input, view, synced: false }
        );
      }
    },
    [methods, targetsOf, remember]
  );

  /**
   * Saves the input of the selected method in every group where it is unsaved, as it is
   * when the save starts. It is marked saved only if it did not change during the request;
   * otherwise a later save follows. For the reset option the save selects it again.
   */
  const saveSelectedInput = useCallback(async () => {
    const { targets, rejectedKeyOf, updateShippingMethod } = latest.current;
    for (const target of targets) {
      const { group, method, scope, reselecting } = target;
      const stored = readCustomerInputs(group.id, scope)[method.handle];
      const input = apiCustomerInput(method, stored ? stored.input : method.data);
      if (
        input === undefined ||
        !needsSave(stored?.synced, JSON.stringify(input), reselecting, rejectedKeyOf(target))
      ) {
        continue;
      }
      recordSent(target, input);
      await updateShippingMethod({
        optionHandle: method.handle,
        deliveryGroupId: group.id,
        customerInput: input,
      });
      markSynced(group.id, scope, method.handle, input);
    }
  }, [markSynced, recordSent]);

  /**
   * Saves the unsaved input of the selected method once typing pauses. Incomplete input
   * is not sent: the section stays invalid until the customer completes it.
   */
  const unsavedKey = useMemo(() => {
    const unsaved = targets.flatMap((target) => {
      const input = apiCustomerInput(target.method, target.method.data);
      if (input === undefined) {
        return [];
      }
      const key = JSON.stringify(input);
      return needsSave(target.method.synced, key, target.reselecting, rejectedKeyOf(target))
        ? [[target.group.id, key]]
        : [];
    });
    return unsaved.length ? JSON.stringify(unsaved) : null;
  }, [targets, rejectedKeyOf]);

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
    if (!unsavedKey || pendingKey || stopped) {
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
  }, [unsavedKey, pendingKey, stopped, failureCount, enqueue, saveSelectedInput]);

  const providerMethodsRecord = useMemo(
    () =>
      methods.reduce<DeliveryProviderMethodsRecord>((acc, method) => {
        (acc[method.provider] ??= []).push(method);
        return acc;
      }, {}),
    [methods]
  );

  /**
   * Price and dates of the selected method, once the API accepted it in every group the list
   * covers: the sum of the shipments and the date of the one arriving last (R9).
   */
  const quotedMethods = useMemo(() => {
    if (pendingKey || !serverKey) {
      return null;
    }
    const quoted = groups.map(quotedMethod);
    return quoted.every((method) => method !== null) ? (quoted as DeliveryMethod[]) : null;
  }, [groups, pendingKey, serverKey]);
  const resetReason = groups.length === 1 ? groups[0].resetReason : null;

  if (!groups.length || !methods.length) {
    return null;
  }

  return (
    <Flex vertical gap={12}>
      {resetReason && !serverKey && !pendingKey && (
        <Alert
          type="warning"
          showIcon
          message={resetReason.message}
          description={t(
            resetKey ? 'delivery-selection-reset-fix' : 'delivery-selection-reset'
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
      {Object.entries(providerMethodsRecord).map(([provider, providerMethods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ProviderModuleType.Delivery}
          provider={provider}
          availableMethods={providerMethods}
          selectedMethod={selectedMethod}
          onSelectMethod={handleSelectMethod}
          onUpdateMethodData={handleUpdateMethodData}
          deliveryAddress={address}
        />
      ))}
      {quotedMethods && <ShipmentQuote methods={quotedMethods} withLabel />}
    </Flex>
  );
};
