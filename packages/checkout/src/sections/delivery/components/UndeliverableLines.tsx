'use client';

import { Alert, Button, Flex } from 'antd';
import { useTranslations } from 'next-intl';
import {
  useRemoveCartLines,
  useUndeliverableLines,
} from '#checkout/hooks/useUndeliverableLines';
import { useConfirm } from '#checkout/ui/useConfirm';
import { toast } from '#checkout/ui/toast';
import { ADDRESS_SECTION_ANCHOR } from '#checkout/sections/address/anchor';
import { ShipmentLines } from './ShipmentLines';

/** Brings the address form into view, so the customer can change the address. */
const focusAddress = () => {
  const section = document.getElementById(ADDRESS_SECTION_ANCHOR);
  section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  section?.querySelector<HTMLElement>('input, button, [tabindex]')?.focus({
    preventScroll: true,
  });
};

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
    } catch (error) {
      console.error('Failed to remove undeliverable lines:', error);
      toast.error(t('undeliverable-remove-failed'));
    }
  };

  return (
    <Alert
      type="error"
      showIcon
      title={t('undeliverable-title')}
      description={
        <Flex vertical gap={12}>
          <ShipmentLines lines={lines} />
          <Flex gap={8} wrap>
            <Button onClick={focusAddress}>{t('undeliverable-change-address')}</Button>
            <Button danger loading={removing} onClick={handleRemove}>
              {t('undeliverable-remove')}
            </Button>
          </Flex>
        </Flex>
      }
    />
  );
};
