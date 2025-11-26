import { Flex, Divider, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { Money } from '@src/ui-kit/Price/Money';
import type { Checkout } from '@src/modules/checkout/types/entity';
import { ShippingPaymentModel } from '@codegen/schema-client';

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

  // Check if shipping is paid separately (CARRIER_DIRECT)
  const isShippingPaidSeparately =
    checkout?.deliveryGroups?.[0]?.estimatedCost?.paymentModel ===
    ShippingPaymentModel.CarrierDirect;

  const getShippingValue = () => {
    if (isShippingPaidSeparately) {
      return t('shipping-paid-separately');
    }
    if (checkout?.cost?.totalShippingAmount) {
      return <Money money={checkout.cost.totalShippingAmount} />;
    }
    return '';
  };

  const hasDiscount = () => {
    return (
      checkout?.cost?.totalDiscountAmount &&
      checkout.cost.totalDiscountAmount.amount > 0
    );
  };

  const hasTax = () => {
    return (
      checkout?.cost?.totalTaxAmount &&
      checkout.cost.totalTaxAmount.amount > 0
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
        <Text className={styles.lineValue}>{getShippingValue()}</Text>
      </Flex>
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
  totalLabel: css`
    font-size: ${token.fontSizeXL}px;
  `,
  totalValue: css`
    font-size: ${token.fontSizeXL}px;
  `,
}));
