'use client';

import { Typography } from 'antd';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '#checkout/ui/Money';
import {
  shippingQuote,
  type QuoteMethod,
  type ShippingPrice,
} from '../shipments';

const { Text } = Typography;

const DATE_FORMAT = { day: 'numeric', month: 'short' } as const;

/** Shipping price as the customer reads it: an amount, free or the carrier's rates. */
export function useShippingPriceLabel() {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  return (price: ShippingPrice): string => {
    switch (price.kind) {
      case 'free':
        return t('shipping-free');
      case 'carrier':
        return t('shipping-carrier-rates');
      case 'amount':
        return formatMoney(locale, price.amount);
      case 'amount-and-carrier':
        return t('shipping-amount-and-carrier-rates', {
          amount: formatMoney(locale, price.amount),
        });
    }
  };
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
 * Price and estimated dates of the selected options of one or more shipments. Shown only
 * for options the API accepted with their input, so the price is the one the order takes.
 */
export const ShipmentQuote = ({
  methods,
  withLabel = false,
}: {
  methods: QuoteMethod[];
  /** Prefixes the price with "Shipping:" where nothing else says what it is. */
  withLabel?: boolean;
}) => {
  const t = useTranslations('Checkout');
  const priceLabel = useShippingPriceLabel();
  const estimateLabel = useEstimateLabel();
  const quote = shippingQuote(methods);
  if (!quote) {
    return null;
  }
  const estimate = estimateLabel(quote.estimatedMinDeliveryAt, quote.estimatedMaxDeliveryAt);
  const price = priceLabel(quote.price);
  return (
    <Text type="secondary">
      {withLabel ? `${t('shipping')}: ${price}` : price}
      {estimate ? ` · ${t('delivery-estimate', { dates: estimate })}` : ''}
    </Text>
  );
};
