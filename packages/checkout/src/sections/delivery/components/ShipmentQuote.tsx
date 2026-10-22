'use client';

import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { formatMoney, Money } from '#checkout/ui/Money';
import type { Checkout } from '#checkout/types/entity';
import {
  shippingQuote,
  type QuotedShipment,
  type ShippingPrice,
} from '../shipments';

const { Text } = Typography;

const DATE_FORMAT = { day: 'numeric', month: 'short' } as const;

/**
 * Shipping price as the customer reads it: an amount, free or the carrier's rates. What free
 * shipping or a shipping discount took off is struck through before it: the price, or the
 * carrier's rates when free shipping covers a carrier charge of unknown price.
 */
export const ShippingPriceValue = ({ price }: { price: ShippingPrice }) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const struck =
    price.kind === 'carrier' ? null : price.original ? (
      <Money money={price.original} />
    ) : price.kind === 'free' && price.carrierWaived ? (
      t('shipping-carrier-rates')
    ) : null;
  return (
    <>
      {struck ? (
        <>
          <Text delete type="secondary">
            {struck}
          </Text>{' '}
        </>
      ) : null}
      {price.kind === 'free' && t('shipping-free')}
      {price.kind === 'carrier' && t('shipping-carrier-rates')}
      {price.kind === 'amount' && <Money money={price.amount} />}
      {price.kind === 'amount-and-carrier' &&
        t('shipping-amount-and-carrier-rates', {
          amount: formatMoney(locale, price.amount),
        })}
    </>
  );
};

/** Why shipping is free, in the server's words: the discount, the loyalty tier or the reward. */
export function useFreeShippingReason() {
  const t = useTranslations('Checkout');
  return (reasons: Checkout.FreeShipping[]): string | null =>
    reasons.length
      ? t('shipping-free-because', {
          reasons: reasons
            .map(({ source, title }) =>
              source === 'LOYALTY_TIER'
                ? t('shipping-free-reason-tier', { title })
                : source === 'LOYALTY_REWARD'
                  ? t('shipping-free-reason-reward', { title })
                  : title
            )
            .join(', '),
        })
      : null;
}

/** Estimated delivery dates as a short range ("20–22 Oct"), or `null` when unknown. */
export function useEstimateLabel() {
  const format = useFormatter();
  return (min: Date | null, max: Date | null): string | null => {
    if (min && max && min.getTime() !== max.getTime()) {
      return format.dateTimeRange(min, max, DATE_FORMAT);
    }
    const date = max ?? min;
    return date ? format.dateTime(date, DATE_FORMAT) : null;
  };
}

/**
 * Price and estimated dates of the selected options of one or more shipments, with why
 * shipping is free. Shown only for options the API accepted with their input, so the price is
 * the one the order takes.
 */
export const ShipmentQuote = ({ shipments }: { shipments: QuotedShipment[] }) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const estimateLabel = useEstimateLabel();
  const reasonLabel = useFreeShippingReason();
  const quote = shippingQuote(shipments);
  if (!quote) {
    return null;
  }
  const estimate = estimateLabel(quote.estimatedMinDeliveryAt, quote.estimatedMaxDeliveryAt);
  const reason = reasonLabel(quote.freeShipping);
  return (
    <Flex vertical align="flex-start">
      <Text type="secondary" className={styles.note}>
        <ShippingPriceValue price={quote.price} />
        {estimate ? ` · ${t('delivery-estimate', { dates: estimate })}` : ''}
      </Text>
      {reason ? (
        <Text type="success" className={styles.note}>
          {reason}
        </Text>
      ) : null}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // A note under the delivery methods, in the small text of the other notes.
  note: css`
    font-size: ${token.fontSizeSM}px;
  `,
}));
