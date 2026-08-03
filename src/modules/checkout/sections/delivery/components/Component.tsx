'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ProviderRenderer } from '@src/modules/checkout/infra/ProviderRenderer';
import { useMemo, useState, useEffect, useCallback } from 'react';
import type {
  DeliveryFormData,
  DeliveryGroupRecord,
  DeliveryProviderMethodsRecord,
  DeliveryMethod,
} from '../types';
import {
  ProviderModuleType,
  type ProviderMethod,
} from '@src/modules/checkout/vendors/types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';

type CustomerInputsByMethod = Record<string, unknown>;

const CUSTOMER_INPUT_STORAGE_PREFIX = 'checkout-delivery-customer-input';

const getCustomerInputStorageKey = (deliveryGroupId: string) =>
  `${CUSTOMER_INPUT_STORAGE_PREFIX}:${deliveryGroupId}`;

const readCustomerInputs = (
  deliveryGroupId: string | undefined
): CustomerInputsByMethod => {
  if (!deliveryGroupId || typeof window === 'undefined') {
    return {};
  }

  try {
    const value = window.sessionStorage.getItem(
      getCustomerInputStorageKey(deliveryGroupId)
    );
    return value ? (JSON.parse(value) as CustomerInputsByMethod) : {};
  } catch {
    return {};
  }
};

const writeCustomerInputs = (
  deliveryGroupId: string | undefined,
  inputs: CustomerInputsByMethod
) => {
  if (!deliveryGroupId || typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getCustomerInputStorageKey(deliveryGroupId),
      JSON.stringify(inputs)
    );
  } catch {
    // Storage can be unavailable or full; optimistic in-memory state still works.
  }
};

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
  const { selectDeliveryMethod, updateShippingMethod } = useCheckoutApi();
  // Extract current selected method from data
  const [, deliveryGroup] = Object.entries(data ?? {}).at(0) || [];
  const {
    id: deliveryGroupId,
    selectedDeliveryMethod: serverSelectedMethod,
    deliveryMethods,
    address,
  } = deliveryGroup || {};

  /**
   * Local state for optimistic UI updates
   * This allows the UI to respond immediately while the API request is processing
   */
  const [localSelectedMethod, setLocalSelectedMethod] =
    useState<DeliveryMethod | null>(serverSelectedMethod ?? null);
  const [customerInputs, setCustomerInputs] = useState<CustomerInputsByMethod>(
    {}
  );

  useEffect(() => {
    setCustomerInputs(readCustomerInputs(deliveryGroupId));
  }, [deliveryGroupId]);

  const rememberCustomerInput = useCallback(
    (methodHandle: string, customerInput: unknown) => {
      setCustomerInputs((current) => {
        const next = { ...current };
        if (customerInput === undefined) {
          delete next[methodHandle];
        } else {
          next[methodHandle] = customerInput;
        }
        writeCustomerInputs(deliveryGroupId, next);
        return next;
      });
    },
    [deliveryGroupId]
  );

  /**
   * Sync local state when data changes from API
   */
  useEffect(() => {
    const persistedInputs = readCustomerInputs(deliveryGroupId);
    setLocalSelectedMethod(
      serverSelectedMethod
        ? {
            ...serverSelectedMethod,
            data: persistedInputs[serverSelectedMethod.handle],
          }
        : null
    );
  }, [deliveryGroupId, serverSelectedMethod]);

  /**
   * Handle delivery method selection with optimistic update
   */
  const handleSelectMethod = useCallback(
    async (method: ProviderMethod) => {
      // Find full method object from deliveryMethods
      const fullMethod = deliveryMethods?.find(
        (m) => m.code === method.code && m.provider === method.provider
      );

      if (!fullMethod || !deliveryGroupId) {
        console.error('Delivery method or group not found:', method);
        return;
      }

      // Optimistically update local state for immediate UI feedback
      const customerInput = customerInputs[fullMethod.handle];
      setLocalSelectedMethod({ ...fullMethod, data: customerInput });

      try {
        // Call API to persist the selection
        await selectDeliveryMethod({
          optionHandle: fullMethod.handle,
          deliveryGroupId,
          customerInput,
        });
      } catch (error) {
        // On error, revert to previous state
        console.error('Failed to select delivery method:', error);
        const persistedInputs = readCustomerInputs(deliveryGroupId);
        setLocalSelectedMethod(
          serverSelectedMethod
            ? {
                ...serverSelectedMethod,
                data: persistedInputs[serverSelectedMethod.handle],
              }
            : null
        );
      }
    },
    [
      selectDeliveryMethod,
      serverSelectedMethod,
      deliveryMethods,
      deliveryGroupId,
      customerInputs,
    ]
  );

  /**
   * Handle delivery method data update (e.g., address, warehouse changes)
   * Used when the selected method remains the same but form data changes
   */
  const handleUpdateMethodData = useCallback(
    async (updatedData: unknown) => {
      if (!localSelectedMethod || !deliveryGroupId) {
        console.error('No method selected to update');
        return;
      }

      // Create updated method with new data
      const updatedMethod: DeliveryMethod = {
        ...localSelectedMethod,
        data: updatedData,
      };

      // Store previous state for rollback
      const previousMethod = localSelectedMethod;
      const previousCustomerInput = customerInputs[localSelectedMethod.handle];

      // Optimistically update local state for immediate UI feedback
      setLocalSelectedMethod(updatedMethod);
      rememberCustomerInput(localSelectedMethod.handle, updatedData);

      try {
        // Call API to persist the updated data
        await updateShippingMethod({
          optionHandle: localSelectedMethod.handle,
          deliveryGroupId,
          customerInput: updatedData,
        });
      } catch (error) {
        // On error, revert to previous state
        console.error('Failed to update delivery method data:', error);
        setLocalSelectedMethod(previousMethod);
        rememberCustomerInput(
          localSelectedMethod.handle,
          previousCustomerInput
        );
      }
    },
    [
      updateShippingMethod,
      localSelectedMethod,
      deliveryGroupId,
      customerInputs,
      rememberCustomerInput,
    ]
  );

  const deliveryGroups = useMemo(() => {
    /** Currently only a single group is supported */
    const result: DeliveryGroupRecord[] = [];
    const [, deliveryGroup] = Object.entries(data ?? {}).at(0) || [];

    const { id: deliveryGroupId, deliveryMethods } = deliveryGroup || {};

    /** Return empty object if no payment methods */
    if (!deliveryGroupId || !deliveryMethods?.length) {
      return result;
    }

    const providerMethodsRecord =
      deliveryMethods.reduce<DeliveryProviderMethodsRecord>((acc, method) => {
        const { provider, handle, code, title, description, publicData } =
          method;
        if (!acc[provider]) {
          acc[provider] = [];
        }
        acc[provider].push({
          handle,
          code,
          title,
          description,
          data: customerInputs[handle],
          publicData,
          provider,
        });
        return acc;
      }, {});

    result.push({
      id: deliveryGroupId,
      selectedDeliveryMethod: localSelectedMethod,
      providerMethodsRecord,
    });
    return result;
  }, [customerInputs, data, localSelectedMethod]);

  return (
    <>
      {deliveryGroups.map(
        ({ id, providerMethodsRecord, selectedDeliveryMethod }) => (
          <Flex key={id} vertical gap={12} className={styles.container}>
            {Object.entries(providerMethodsRecord).map(
              ([provider, methods]) => (
                <ProviderRenderer
                  key={provider}
                  moduleType={ProviderModuleType.Delivery}
                  provider={provider}
                  availableMethods={methods}
                  selectedMethod={selectedDeliveryMethod ?? null}
                  onSelectMethod={handleSelectMethod}
                  onUpdateMethodData={handleUpdateMethodData}
                  deliveryAddress={address}
                />
              )
            )}
          </Flex>
        )
      )}
    </>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySectionView;
