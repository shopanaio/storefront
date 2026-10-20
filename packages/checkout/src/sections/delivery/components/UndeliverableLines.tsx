'use client';

import { Button, Flex } from 'antd';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { useTranslations } from 'next-intl';
import {
  useRemoveCartLines,
  useUndeliverableLines,
} from '#checkout/hooks/useUndeliverableLines';
import { useConfirm } from '#checkout/ui/useConfirm';
import {
  clearSaveError,
  reportSaveError,
} from '#checkout/state/banners/bannerStore';
import { SectionId } from '#checkout/state/interface';
import { focusAnchor, sectionAnchor } from '#checkout/ui/focusAnchor';
import { ShipmentLines } from './ShipmentLines';

/** Brings the address form into view, so the customer can change the address. */
const focusAddress = () => focusAnchor(sectionAnchor(SectionId.Address));

const REMOVE_ERROR_KEY = 'remove-undeliverable-lines';

/**
 * Lines that cannot be delivered to the address (R7). They block the whole order; the
 * customer changes the address or removes them from the cart, after which the checkout
 * is recalculated.
 */
export const UndeliverableLines = () => {
  const t = useTranslations('Checkout');
  const lines = useUndeliverableLines();
  const { remove, removing } = useRemoveCartLines();
  const confirm = useConfirm();

  if (!lines.length) {
    return null;
  }

  const handleRemove = async () => {
    const confirmed = await confirm({
      title: t('undeliverable-remove-confirm-title'),
      content: t('undeliverable-remove-confirm', { count: lines.length }),
      okText: t('undeliverable-remove'),
      okButtonProps: { danger: true },
      cancelText: t('undeliverable-remove-cancel'),
    });
    if (!confirmed) {
      return;
    }
    try {
      await remove(lines);
      clearSaveError(REMOVE_ERROR_KEY);
    } catch (error) {
      console.error('Failed to remove undeliverable lines:', error);
      reportSaveError({
        key: REMOVE_ERROR_KEY,
        message: t('undeliverable-remove-failed'),
        sectionId: SectionId.Delivery,
      });
    }
  };

  return (
    <CheckoutBanner tone="action" title={t('undeliverable-title')}>
      <Flex vertical gap={12}>
        <ShipmentLines lines={lines} />
        <Flex gap={8} wrap>
          <Button onClick={focusAddress}>{t('undeliverable-change-address')}</Button>
          <Button danger loading={removing} onClick={handleRemove}>
            {t('undeliverable-remove')}
          </Button>
        </Flex>
      </Flex>
    </CheckoutBanner>
  );
};
