'use client';

import { Alert, Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import type { DeliveryAddress, DeliveryGroup } from '../types';
import {
  commonMethods,
  commonSelectionKey,
  methodKey,
  quotedMethod,
  selectionsDiffer,
} from '../shipments';
import { DeliveryMethodList } from './DeliveryMethodList';
import { ShipmentLines } from './ShipmentLines';
import { ShipmentQuote } from './ShipmentQuote';

const { Text } = Typography;

/**
 * Several delivery groups, shown as shipments as in Shopify split shipping (R1): one list of
 * the methods every shipment offers, applied to all of them, with no method preselected and
 * no price before it is known. "Other delivery options" picks a method for each shipment,
 * also one the other shipments do not offer, so a shipment never lacks a control.
 *
 * The shared list shows one method with one input. Whenever the shipments differ (another
 * method or another branch), they are shown one by one, so the page never hides where a
 * shipment goes; only a selection being applied to all of them keeps the shared list.
 */
export const Shipments = ({
  groups,
  address,
}: {
  groups: DeliveryGroup[];
  address: DeliveryAddress | null;
}) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const common = useMemo(() => commonMethods(groups), [groups]);
  const differ = selectionsDiffer(groups);
  /** The customer asked for "other delivery options". */
  const [perShipment, setPerShipment] = useState(differ);
  /** Method being applied to every shipment from the shared list. */
  const [selecting, setSelecting] = useState(false);
  /** Method of a shipment that "one method for all" applies to the others. */
  const [unifyKey, setUnifyKey] = useState<string | null>(null);
  const applying = selecting || unifyKey !== null;
  const byShipment = common.length === 0 || perShipment || (differ && !applying);
  const sharedKey = commonSelectionKey(groups);

  /**
   * "One method for all shipments": when they differ, the method (and input) of the first
   * shipment whose method every shipment offers goes to all of them.
   */
  const unifySource = useMemo(() => {
    const commonKeys = new Set(common.map(methodKey));
    const source = groups.find(
      (group) =>
        group.selectedDeliveryMethod &&
        commonKeys.has(methodKey(group.selectedDeliveryMethod))
    );
    return source?.selectedDeliveryMethod ? methodKey(source.selectedDeliveryMethod) : null;
  }, [groups, common]);
  const canShare = common.length > 0 && (!differ || unifySource !== null);
  const shareForAll = () => {
    setPerShipment(false);
    setUnifyKey(differ ? unifySource : null);
  };
  const handleSelectingChange = useCallback((value: boolean) => {
    setSelecting(value);
    if (!value) {
      setUnifyKey(null);
    }
  }, []);

  return (
    <Flex vertical gap={12}>
      <Text strong>{t('delivery-shipments-count', { count: groups.length })}</Text>
      {!byShipment && (
        <DeliveryMethodList
          groups={groups}
          methods={common}
          address={address}
          initialSelectKey={unifyKey}
          onSelectingChange={handleSelectingChange}
        />
      )}
      <Flex vertical gap={8}>
        {groups.map((group, index) => {
          const quoted = quotedMethod(group);
          return (
            <Flex key={group.id} vertical gap={8} className={styles.shipment}>
              <Flex justify="space-between" align="baseline" gap={8} wrap>
                <Text strong>
                  {t('delivery-shipment-title', {
                    index: index + 1,
                    count: groups.length,
                  })}
                </Text>
                {!byShipment && quoted && sharedKey ? (
                  <ShipmentQuote methods={[quoted]} />
                ) : null}
              </Flex>
              <ShipmentLines lines={group.lines} />
              {byShipment ? (
                <DeliveryMethodList
                  groups={[group]}
                  methods={group.deliveryMethods}
                  address={address}
                />
              ) : (
                group.resetReason &&
                !group.selectedDeliveryMethod && (
                  <Alert type="warning" showIcon message={group.resetReason.message} />
                )
              )}
            </Flex>
          );
        })}
      </Flex>
      {byShipment ? (
        canShare && (
          <Button type="link" className={styles.link} onClick={shareForAll}>
            {t('delivery-same-for-all-shipments')}
          </Button>
        )
      ) : (
        <Button type="link" className={styles.link} onClick={() => setPerShipment(true)}>
          {t('delivery-other-options')}
        </Button>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  shipment: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    padding: ${token.paddingSM}px;
  `,
  link: css`
    padding: 0;
    align-self: flex-start;
  `,
}));
