import { Flex, Divider, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { Money } from '#checkout/ui/Money';
import type { Checkout } from '#checkout/types/entity';
import { useShippingQuote } from '#checkout/sections/delivery/useShippingQuote';
import {
  useEstimateLabel,
  useShippingPriceLabel,
} from '#checkout/sections/delivery/components/ShipmentQuote';

const { Text } = Typography;

interface SummaryTotalsProps {
  checkout: Checkout.Checkout;
}

/**
 * A component for displaying checkout cost summary including subtotal, shipping, discounts, taxes and total
 */
export const SummaryTotals = ({ checkout }: SummaryTotalsProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();

  const priceLabel = useShippingPriceLabel();
  const estimateLabel = useEstimateLabel();
  /**
   * Shipping of the selected options of every shipment (R9): the amount the merchant
   * collects, "free" or the carrier's rates. Unknown until every shipment has its option
   * and its input is saved, as in the delivery section.
   */
  const quote = useShippingQuote(checkout);
  const shippingValue = quote ? priceLabel(quote.price) : t('shipping-not-selected');
  const arrivesBy = quote ? estimateLabel(null, quote.estimatedMaxDeliveryAt) : null;

  const hasDiscount = () => {
    return (
      checkout?.cost?.totalDiscountAmount &&
      checkout.cost.totalDiscountAmount.amount > 0
    );
  };

  const hasTax = () => {
    return (
      checkout?.cost?.totalTaxAmount && checkout.cost.totalTaxAmount.amount > 0
    );
  };

  return (
    <Flex vertical gap={8}>
      <Flex justify="space-between">
        <Text className={styles.lineLabel}>{t('subtotal')}</Text>
        <Text className={styles.lineValue}>
          <Money money={checkout.cost.subtotalAmount} />
        </Text>
      </Flex>
      <Flex justify="space-between">
        <Text className={styles.lineLabel}>{t('shipping')}</Text>
        <Text className={styles.lineValue} type={quote ? undefined : 'secondary'}>
          {shippingValue}
        </Text>
      </Flex>
      {arrivesBy && (
        <Text type="secondary" className={styles.note}>
          {t('delivery-arrives-by', { date: arrivesBy })}
        </Text>
      )}
      {hasDiscount() && (
        <Flex justify="space-between">
          <Text className={styles.lineLabel}>{t('discount')}</Text>
          <Text className={styles.lineValue}>
            -<Money money={checkout.cost.totalDiscountAmount} />
          </Text>
        </Flex>
      )}
      {hasTax() && (
        <Flex justify="space-between">
          <Text className={styles.lineLabel}>{t('tax')}</Text>
          <Text className={styles.lineValue}>
            <Money money={checkout.cost.totalTaxAmount!} />
          </Text>
        </Flex>
      )}
      <Divider style={{ margin: 0 }} />
      <Flex justify="space-between" align="center">
        <Text strong className={styles.totalLabel}>
          {t('total')}
        </Text>
        <Text strong className={styles.totalValue}>
          {checkout ? <Money money={checkout.cost.totalAmount} /> : null}
        </Text>
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  lineLabel: css`
    font-size: ${token.fontSize}px;
  `,
  lineValue: css`
    font-size: ${token.fontSize}px;
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
    margin-top: -${token.marginXS}px;
  `,
  totalLabel: css`
    font-size: ${token.fontSizeXL}px;
  `,
  totalValue: css`
    font-size: ${token.fontSizeXL}px;
  `,
}));
