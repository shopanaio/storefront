'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ProviderRenderer } from '@src/modules/checkout/infra/ProviderRenderer';
import { useMemo } from 'react';
import type {
  DeliveryFormData,
  DeliveryGroupRecord,
  DeliveryProviderMethodsRecord,
} from '../types';
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';

/**
 * View component for the delivery section.
 *
 * Pure controlled UI component that renders the delivery form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 */
export interface DeliverySectionViewProps {
  /** Current form data */
  data: DeliveryFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const DeliverySectionView = ({ data }: DeliverySectionViewProps) => {
  const { styles } = useStyles();

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
        });
        return acc;
      }, {});

    result.push({
      id: deliveryGroupId,
      selectedDeliveryMethod,
      providerMethodsRecord,
    });
    return result;
  }, [data]);

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
