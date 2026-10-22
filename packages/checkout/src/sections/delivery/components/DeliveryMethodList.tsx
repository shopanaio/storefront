'use client';

import { Flex } from 'antd';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { SectionId } from '#checkout/state/interface';
import { resetReasonMessageKey } from '#checkout/state/banners/messages';
import { useTranslations } from 'next-intl';
import { ProviderRenderer } from '#checkout/infra/ProviderRenderer';
import { MethodPanelsSkeleton } from '#checkout/components/common/MethodPanelsSkeleton';
import { LoadingBoundary } from '#checkout/ui/LoadingBoundary';
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
import { isMutationSuperseded } from '@shopana/storefront-sdk/modules/cart/core/utils/mutationQueue';
import { validateCustomerInput } from '#checkout/utils/jsonSchema';
import {
  addressScope,
  readCustomerInputs,
  sameInput,
  storedInputOf,
  useCustomerInputStore,
} from '../customerInputStorage';
import { definitiveRejection } from '../saveError';
import { closedCheckoutCode } from '#checkout/state/closedCheckout';
import {
  carrierChargeWaived,
  commonSelectionKey,
  isGroupOf,
  methodKey,
  methodOfGroup,
  quotedShipment,
  type QuotedShipment,
} from '../shipments';
import { ShipmentQuote } from './ShipmentQuote';

/** Pause in typing after which an edited customer input is saved. */
const SAVE_DELAY_MS = 600;
/** Retries of a failed save: 2 s, 4 s, 8 s … up to 30 s, until it succeeds. */
const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 30_000;

/** Input sent to the API: only one that satisfies the option's contract. */
const apiCustomerInput = (
  method: DeliveryMethod,
  input: unknown
): object | undefined =>
  typeof input === 'object' &&
  input !== null &&
  validateCustomerInput(method.customerInputContract, input).length === 0
    ? input
    : undefined;

const sentKey = (groupId: string, scope: string, method: DeliveryMethod) =>
  `${groupId}\n${scope}\n${methodKey(method)}`;

/** The delivery groups changed while the selection was on the way (BR-escc). */
const GROUP_CHANGED_CODE = 'CHECKOUT_DELIVERY_GROUP_CHANGED';
const isGroupChanged = (error: unknown) =>
  Array.isArray(error) &&
  error.some(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      item.code === GROUP_CHANGED_CODE
  );

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
  const resetKey = useMemo(
    () => (serverKey ? null : resetKeyOf(groups)),
    [groups, serverKey]
  );

  /** Method picked by the customer while the API requests are in flight. */
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  /**
   * Method whose selection the API refused because the shipments changed meanwhile. It is
   * not retried (BR-escc): the section says why and the buyer chooses again.
   */
  const [groupChangedKey, setGroupChangedKey] = useState<string | null>(null);
  /** Method whose selection failed in some groups; a retry selects it only in those. */
  const [failedSelect, setFailedSelect] = useState<{
    key: string;
    groupIds: string[];
  } | null>(null);
  /** Groups that still lack the method whose selection failed in them. */
  const unsavedGroups = useMemo(
    () =>
      failedSelect
        ? groups.filter(
            (group) =>
              failedSelect.groupIds.some((id) => isGroupOf(group, id)) &&
              (!group.selectedDeliveryMethod ||
                methodKey(group.selectedDeliveryMethod) !== failedSelect.key)
          )
        : [],
    [groups, failedSelect]
  );
  const failedKey =
    unsavedGroups.length && failedSelect ? failedSelect.key : null;
  const selectedKey = pendingKey ?? failedKey ?? serverKey ?? resetKey;
  const [lead] = groups;
  const selectedMethod = useMemo(
    () =>
      methods.find((method) => methodKey(method) === selectedKey) ??
      (lead?.selectedDeliveryMethod &&
      methodKey(lead.selectedDeliveryMethod) === selectedKey
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
  const targets = useMemo(
    () => targetsOf(selectedKey),
    [targetsOf, selectedKey]
  );

  /** Input last sent for each option, by group, address scope and handle. */
  const [sentInputs, setSentInputs] = useState<Record<string, string>>({});
  const recordSent = useCallback(
    (target: Target, input: unknown) =>
      setSentInputs((current) => ({
        ...current,
        [sentKey(target.group.id, target.scope, target.method)]:
          JSON.stringify(input),
      })),
    []
  );
  /** Input of the reset option the API refused; it is not sent again by itself. */
  const rejectedKeyOf = useCallback(
    (target: Target) =>
      target.reselecting
        ? (sentInputs[sentKey(target.group.id, target.scope, target.method)] ??
          null)
        : null,
    [sentInputs]
  );

  /** Latest selection, for a save that starts after this render. */
  const latest = useRef({ targets, rejectedKeyOf });
  useEffect(() => {
    latest.current = { targets, rejectedKeyOf };
  });
  /** Number of the latest selection; an earlier one that settles later changes nothing. */
  const latestSelect = useRef(0);

  /**
   * Selects the method in the given groups. The input entered for it in the first group that
   * has one goes to all of them: the same method takes the same input in each shipment.
   * The requests join the checkout mutation queue in group order; a group that fails is
   * reported on its own and a retry selects the method only there (SC-wdj1).
   */
  const selectIn = useCallback(
    async (key: string, selected: Target[]) => {
      const run = ++latestSelect.current;
      setPendingKey(key);
      setFailedSelect(null);
      setGroupChangedKey(null);

      // The input entered for the method in the first group that has one.
      const storedOf = (target: Target) =>
        storedInputOf(
          readCustomerInputs(target.group, target.scope),
          target.method
        );
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
        if (!sameInput(stored?.input, leadStored.input)) {
          remember(group, scope, method, { ...leadStored, synced: false });
        }
        return leadStored.input;
      });
      const results = await Promise.allSettled(
        selected.map(async (target, index) => {
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
            markSynced(group, scope, method, customerInput);
          }
        })
      );
      if (run !== latestSelect.current) {
        // A newer selection took over; it reports its own outcome.
        return;
      }
      const reasons = results.flatMap((result) =>
        result.status === 'rejected' && !isMutationSuperseded(result.reason)
          ? [result.reason]
          : []
      );
      reasons.forEach((reason) =>
        console.error('Failed to select delivery method:', reason)
      );
      const failed = selected.filter((target, index) => {
        const result = results[index];
        return (
          result.status === 'rejected' &&
          !isMutationSuperseded(result.reason) &&
          // A closed checkout is not retried; the checkout itself tells the customer why.
          !closedCheckoutCode(result.reason) &&
          // Changed shipments are not retried either: the answer brought the new ones.
          !isGroupChanged(result.reason)
        );
      });
      setGroupChangedKey(reasons.some(isGroupChanged) ? key : null);
      setFailedSelect(
        failed.length
          ? { key, groupIds: failed.map((target) => target.group.id) }
          : null
      );
      setPendingKey(null);
    },
    [selectDeliveryMethod, remember, markSynced, recordSent]
  );

  const handleSelectMethod = useCallback(
    async (method: ProviderMethod) => {
      const key = methodKey(method);
      const selected = targetsOf(key);
      if (!selected.length) {
        console.error('Delivery method or group not found:', method);
        return;
      }
      await selectIn(key, selected);
    },
    [targetsOf, selectIn]
  );

  /** Selects the failed method again, only in the groups where it was not saved. */
  const retryFailedSelect = () => {
    if (!failedKey) {
      return;
    }
    void selectIn(
      failedKey,
      targetsOf(failedKey).filter((target) =>
        unsavedGroups.includes(target.group)
      )
    );
  };

  /**
   * The parent learns when a selection starts and ends, not about the first render. A
   * selection that failed in some groups is still being applied until it is retried.
   */
  const selecting = pendingKey !== null || failedKey !== null;
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
    const method = methods.find(
      (candidate) => methodKey(candidate) === initialSelectKey
    );
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
      for (const { group, method: groupMethod, scope } of targetsOf(
        methodKey(method)
      )) {
        // An emptied form stays a draft too: dropping it would bring back the input the API
        // saved, which the form no longer shows.
        remember(group, scope, groupMethod, { input, view, synced: false });
      }
    },
    [methods, targetsOf, remember]
  );

  /**
   * Saves the input of the selected method in every group where it is unsaved, as it is
   * when the save starts. It is marked saved only if it did not change during the request;
   * otherwise a later save follows. For the reset option the save selects it again.
   *
   * A selection the buyer makes meanwhile wins (BR-q2xm): the save stops before sending
   * anything for an earlier method, and each group is read from the latest render.
   */
  const saveSelectedInput = useCallback(async () => {
    const run = latestSelect.current;
    for (let index = 0; ; index += 1) {
      if (latestSelect.current !== run) {
        return;
      }
      const { targets, rejectedKeyOf } = latest.current;
      const target = targets[index];
      if (!target) {
        return;
      }
      const { group, method, scope, reselecting } = target;
      const stored = storedInputOf(readCustomerInputs(group, scope), method);
      const input = apiCustomerInput(
        method,
        stored ? stored.input : method.data
      );
      if (
        input === undefined ||
        !needsSave(
          stored?.synced,
          JSON.stringify(input),
          reselecting,
          rejectedKeyOf(target)
        )
      ) {
        continue;
      }
      recordSent(target, input);
      try {
        await updateShippingMethod({
          optionHandle: method.handle,
          deliveryGroupId: group.id,
          customerInput: input,
        });
      } catch (error) {
        // A newer save of this group's input took the place of this one and follows it.
        if (isMutationSuperseded(error)) return;
        throw error;
      }
      markSynced(group, scope, method, input);
    }
  }, [updateShippingMethod, markSynced, recordSent]);

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
      return needsSave(
        target.method.synced,
        key,
        target.reselecting,
        rejectedKeyOf(target)
      )
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
      saveSelectedInput().catch((error) => {
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
  }, [unsavedKey, pendingKey, stopped, failureCount, saveSelectedInput]);

  /**
   * Price and dates of the selected method, once the API accepted it in every group the list
   * covers: the shipping the server settled for the shipments and the date of the one
   * arriving last (R9).
   */
  const quotedShipments = useMemo(() => {
    if (pendingKey || !serverKey) {
      return null;
    }
    const quoted = groups.map(quotedShipment);
    return quoted.every((shipment) => shipment !== null)
      ? (quoted as QuotedShipment[])
      : null;
  }, [groups, pendingKey, serverKey]);
  /** Free shipping pays the carrier for the selected method: its carrier note is void. */
  const waivedKey =
    quotedShipments && carrierChargeWaived(quotedShipments) ? serverKey : null;

  const providerMethodsRecord = useMemo(
    () =>
      methods.reduce<DeliveryProviderMethodsRecord>((acc, method) => {
        (acc[method.provider] ??= []).push(
          methodKey(method) === waivedKey
            ? { ...method, carrierChargeWaived: true }
            : method
        );
        return acc;
      }, {}),
    [methods, waivedKey]
  );
  const resetReason = groups.length === 1 ? groups[0].resetReason : null;

  if (!groups.length || !methods.length) {
    return null;
  }

  return (
    <Flex vertical gap={12}>
      {resetReason && !serverKey && !pendingKey && (
        <CheckoutBanner
          tone="action"
          title={t(resetReasonMessageKey(resetReason, SectionId.Delivery))}
          description={t(
            resetKey
              ? 'delivery-selection-reset-fix'
              : 'delivery-selection-reset'
          )}
        />
      )}
      {rejectedMessages && rejectedMessages.length > 0 && (
        <CheckoutBanner
          tone="critical"
          title={t('delivery-input-rejected-title')}
          description={t('delivery-input-rejected')}
          // The customer may save the same input again (SC-mqce).
          action={{ label: t('save'), onClick: () => setFailures(null) }}
        />
      )}
      {groupChangedKey && !pendingKey && serverKey !== groupChangedKey && (
        <CheckoutBanner tone="warning" title={t('delivery-group-changed')} />
      )}
      {failedKey && !pendingKey && (
        <CheckoutBanner
          tone="critical"
          title={
            groups.length > 1
              ? t('delivery-shipments-not-saved', {
                  shipments: unsavedGroups
                    .map((group) => groups.indexOf(group) + 1)
                    .join(', '),
                })
              : t('delivery-not-saved')
          }
          action={{ label: t('banner-retry'), onClick: retryFailedSelect }}
        />
      )}
      {failureCount > 0 && !rejectedMessages && (
        <CheckoutBanner tone="warning" title={t('delivery-input-retrying')} />
      )}
      {Object.entries(providerMethodsRecord).map(
        // Each carrier loads on its own: a new one does not hide the methods already shown.
        ([provider, providerMethods]) => (
          <LoadingBoundary
            key={provider}
            fallback={<MethodPanelsSkeleton count={providerMethods.length} />}
          >
            <ProviderRenderer
              moduleType={ProviderModuleType.Delivery}
              provider={provider}
              availableMethods={providerMethods}
              selectedMethod={selectedMethod}
              onSelectMethod={handleSelectMethod}
              onUpdateMethodData={handleUpdateMethodData}
              deliveryAddress={address}
            />
          </LoadingBoundary>
        )
      )}
      {quotedShipments && <ShipmentQuote shipments={quotedShipments} />}
    </Flex>
  );
};
