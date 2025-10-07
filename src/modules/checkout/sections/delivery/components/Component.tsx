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
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';

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
  console.log('data', data);
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

  /**
   * Sync local state when data changes from API
   */
  useEffect(() => {
    setLocalSelectedMethod(serverSelectedMethod ?? null);
  }, [serverSelectedMethod]);

  /**
   * Handle delivery method selection with optimistic update
   */
  const handleSelectMethod = useCallback(
    async (method: { code: string; data: unknown; provider: string }) => {
      // Find full method object from deliveryMethods
      const fullMethod = deliveryMethods?.find(
        (m) => m.code === method.code && m.provider === method.provider
      );

      if (!fullMethod || !deliveryGroupId) {
        console.error('Delivery method or group not found:', method);
        return;
      }

      // Optimistically update local state for immediate UI feedback
      setLocalSelectedMethod(fullMethod);

      try {
        // Call API to persist the selection
        await selectDeliveryMethod({
          shippingMethodCode: fullMethod.code,
          deliveryGroupId,
          data: fullMethod.data as object | undefined,
          provider: fullMethod.provider,
        });
      } catch (error) {
        // On error, revert to previous state
        console.error('Failed to select delivery method:', error);
        setLocalSelectedMethod(serverSelectedMethod ?? null);
      }
    },
    [
      selectDeliveryMethod,
      serverSelectedMethod,
      deliveryMethods,
      deliveryGroupId,
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

      // Optimistically update local state for immediate UI feedback
      setLocalSelectedMethod(updatedMethod);

      try {
        // Call API to persist the updated data
        await updateShippingMethod({
          shippingMethodCode: localSelectedMethod.code,
          provider: localSelectedMethod.provider,
          deliveryGroupId,
          data: updatedData as object | undefined,
        });
      } catch (error) {
        // On error, revert to previous state
        console.error('Failed to update delivery method data:', error);
        setLocalSelectedMethod(previousMethod);
      }
    },
    [updateShippingMethod, localSelectedMethod, deliveryGroupId]
  );

  const deliveryGroups = useMemo(() => {
    /** Currently only a single group is supported */
    const result: DeliveryGroupRecord[] = [];
    const [, deliveryGroup] = Object.entries(data ?? {}).at(0) || [];

    const {
      id: deliveryGroupId,
      deliveryMethods,
      selectedDeliveryMethod = null,
    } = deliveryGroup || {};

    /** Return empty object if no payment methods */
    if (!deliveryGroupId || !deliveryMethods?.length) {
      return result;
    }

    const providerMethodsRecord =
      deliveryMethods.reduce<DeliveryProviderMethodsRecord>((acc, method) => {
        const { provider, code } = method;
        if (!acc[provider]) {
          acc[provider] = [];
        }
        acc[provider].push({
          code,
          data: method.data,
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
  }, [data, localSelectedMethod]);

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
