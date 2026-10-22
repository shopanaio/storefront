'use client';

import { Divider, Flex, Typography } from 'antd';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { SectionId } from '#checkout/state/interface';
import { resetReasonMessageKey } from '#checkout/state/banners/messages';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { Fragment, useMemo, useState } from 'react';
import { TbArrowsJoin2, TbArrowsSplit2 } from 'react-icons/tb';
import type { DeliveryAddress, DeliveryGroup } from '../types';
import {
  commonMethods,
  commonSelectionKey,
  initialSplitGroupIds,
  methodOfGroup,
} from '../shipments';
import { DeliveryMethodList } from './DeliveryMethodList';
import { ShipmentPlate } from './ShipmentPlate';

const { Text } = Typography;

/**
 * Several delivery groups, shown as shipments as in Shopify split shipping (R1). The shipments
 * share one list of the methods every one of them offers, applied to all of them, with no
 * method preselected and no price before it is known.
 *
 * "Another delivery method" on a shipment takes only that shipment out into a block of its own,
 * with its own list of methods, also ones the other shipments do not offer; the others keep the
 * shared list. "Deliver with the others" puts it back, and the shared method with its input goes
 * to it too. Shipments whose selections already differ start in blocks of their own, so the page
 * never hides where a shipment goes.
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
  /** Groups in blocks of their own, in the order they were taken out. */
  const [splitIds, setSplitIds] = useState(() => initialSplitGroupIds(groups));
  /** Method the shared list applies to its groups after a shipment came back to it. */
  const [mergeKey, setMergeKey] = useState<string | null>(null);

  const shared = useMemo(
    () => groups.filter((group) => !splitIds.includes(group.id)),
    [groups, splitIds]
  );
  const sharedMethods = useMemo(() => commonMethods(shared), [shared]);
  const split = useMemo(
    () => splitIds.flatMap((id) => groups.filter((group) => group.id === id)),
    [groups, splitIds]
  );

  const titleOf = (group: DeliveryGroup) =>
    t('delivery-shipment-title', {
      index: groups.indexOf(group) + 1,
      count: groups.length,
    });

  const takeOut = (group: DeliveryGroup) => {
    setMergeKey(null);
    setSplitIds((ids) => [...ids, group.id]);
  };
  /** A shipment can come back only if it offers a method every shared one does. */
  const canMerge = (group: DeliveryGroup) =>
    commonMethods([...shared, group]).length > 0;
  const merge = (group: DeliveryGroup) => {
    const key = commonSelectionKey(shared);
    setMergeKey(key && methodOfGroup(group, key) ? key : null);
    setSplitIds((ids) => ids.filter((id) => id !== group.id));
  };

  return (
    <Flex vertical gap={12}>
      <Text strong className={styles.heading}>
        {t('delivery-shipments-count', { count: groups.length })}
      </Text>
      <Flex vertical gap={8}>
        {shared.map((group) => (
          <ShipmentPlate
            key={group.id}
            title={titleOf(group)}
            lines={group.lines}
            action={
              shared.length > 1
                ? {
                    label: t('delivery-shipment-split'),
                    icon: <TbArrowsSplit2 />,
                    onClick: () => takeOut(group),
                  }
                : null
            }
          >
            {shared.length > 1 &&
              group.resetReason &&
              !group.selectedDeliveryMethod && (
                <div className={styles.banner}>
                  <CheckoutBanner
                    tone="action"
                    title={t(
                      resetReasonMessageKey(
                        group.resetReason,
                        SectionId.Delivery
                      )
                    )}
                  />
                </div>
              )}
          </ShipmentPlate>
        ))}
      </Flex>
      <DeliveryMethodList
        // A shipment that comes back remounts the list, which then applies the shared method.
        key={shared.map((group) => group.id).join('\n')}
        groups={shared}
        methods={
          shared.length > 1 ? sharedMethods : (shared[0]?.deliveryMethods ?? [])
        }
        address={address}
        initialSelectKey={mergeKey}
      />
      {split.map((group) => (
        <Fragment key={group.id}>
          <Divider className={styles.divider} />
          <ShipmentPlate
            title={titleOf(group)}
            lines={group.lines}
            action={
              canMerge(group)
                ? {
                    label: t('delivery-shipment-merge'),
                    icon: <TbArrowsJoin2 />,
                    onClick: () => merge(group),
                  }
                : null
            }
          />
          <DeliveryMethodList
            groups={[group]}
            methods={group.deliveryMethods}
            address={address}
          />
        </Fragment>
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // Apart from the address above it, as the start of the shipments.
  heading: css`
    margin-top: ${token.marginXS}px;
  `,
  divider: css`
    margin: ${token.marginXS}px 0;
  `,
  banner: css`
    padding-top: ${token.paddingSM}px;
  `,
}));
