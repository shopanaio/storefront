'use client';

import { Flex, Typography } from 'antd';
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
export const ShipmentQuote = ({
  shipments,
  withLabel = false,
}: {
  shipments: QuotedShipment[];
  /** Prefixes the price with "Shipping:" where nothing else says what it is. */
  withLabel?: boolean;
}) => {
  const t = useTranslations('Checkout');
  const estimateLabel = useEstimateLabel();
  const reasonLabel = useFreeShippingReason();
  const quote = shippingQuote(shipments);
  if (!quote) {
    return null;
  }
  const estimate = estimateLabel(quote.estimatedMinDeliveryAt, quote.estimatedMaxDeliveryAt);
  const reason = reasonLabel(quote.freeShipping);
  return (
    <Flex vertical align={withLabel ? 'flex-start' : 'flex-end'}>
      <Text type="secondary">
        {withLabel ? `${t('shipping')}: ` : null}
        <ShippingPriceValue price={quote.price} />
        {estimate ? ` · ${t('delivery-estimate', { dates: estimate })}` : ''}
      </Text>
      {reason ? (
        <Text type="success" style={{ fontSize: 'smaller' }}>
          {reason}
        </Text>
      ) : null}
    </Flex>
  );
};
