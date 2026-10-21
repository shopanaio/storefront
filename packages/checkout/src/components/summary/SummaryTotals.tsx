import { Button, Flex, Divider, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { Money } from '#checkout/ui/Money';
import type { Checkout } from '#checkout/types/entity';
import { useCheckoutTheme } from '#checkout/theme';
import { useCheckoutAuth } from '#checkout/hooks/useCheckoutAuth';
import { LoyaltyIcon } from '#checkout/sections/loyalty/components/LoyaltyIcon';
import { useShippingQuote } from '#checkout/sections/delivery/useShippingQuote';
import {
  ShippingPriceValue,
  useEstimateLabel,
  useFreeShippingReason,
} from '#checkout/sections/delivery/components/ShipmentQuote';

const { Text } = Typography;

interface SummaryTotalsProps {
  checkout: Checkout.Checkout;
}

/**
 * A component for displaying checkout cost summary including subtotal, shipping, discounts, taxes and total.
 * Shipping is shown after free shipping and shipping discounts, with the price before them struck
 * through and why it is free; the discount holds what promotions and rewards took off the goods.
 * What is paid with points or store credit is its own line, and what the order earns is a quiet
 * line under the total.
 */
export const SummaryTotals = ({ checkout }: SummaryTotalsProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();

  const estimateLabel = useEstimateLabel();
  const reasonLabel = useFreeShippingReason();
  /**
   * Shipping of the selected options of every shipment (R9), as the server settled it: the
   * amount charged, "free" or the carrier's rates. Unknown until every shipment has its
   * option and its input is saved, as in the delivery section.
   */
  const quote = useShippingQuote(checkout);
  const arrivesBy = quote ? estimateLabel(null, quote.estimatedMaxDeliveryAt) : null;
  const freeReason = quote ? reasonLabel(quote.freeShipping) : null;
  const discount = checkout.cost.merchandiseDiscountAmount;

  const hasTax = () => {
    return (
      checkout?.cost?.totalTaxAmount && checkout.cost.totalTaxAmount.amount > 0
    );
  };

  return (
    <Flex vertical gap={8} className={styles.root}>
      <Flex justify="space-between">
        <Text className={styles.lineLabel}>{t('subtotal')}</Text>
        <Text className={styles.lineValue}>
          <Money money={checkout.cost.subtotalAmount} />
        </Text>
      </Flex>
      <Flex justify="space-between">
        <Text className={styles.lineLabel}>{t('shipping')}</Text>
        <Text className={styles.lineValue} type={quote ? undefined : 'secondary'}>
          {quote ? <ShippingPriceValue price={quote.price} /> : t('shipping-not-selected')}
        </Text>
      </Flex>
      {freeReason && (
        <Text type="success" className={styles.note}>
          {freeReason}
        </Text>
      )}
      {arrivesBy && (
        <Text type="secondary" className={styles.note}>
          {t('delivery-arrives-by', { date: arrivesBy })}
        </Text>
      )}
      {discount.amount > 0 && (
        <Flex justify="space-between">
          <Text className={styles.lineLabel}>{t('discount')}</Text>
          <Text className={styles.lineValue}>
            -<Money money={discount} />
          </Text>
        </Flex>
      )}
      {checkout.cost.loyaltyAmount.amount > 0 && (
        <Flex justify="space-between">
          <Text className={styles.lineLabel}>
            {t(
              checkout.loyaltyRedemption?.source === 'STORE_CREDIT'
                ? 'loyalty-total-store-credit'
                : 'loyalty-total-points'
            )}
          </Text>
          <Text className={styles.lineValue}>
            -<Money money={checkout.cost.loyaltyAmount} />
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
      <Divider className={styles.divider} />
      <Flex justify="space-between" align="center">
        <Text strong className={styles.totalLabel}>
          {t('total')}
        </Text>
        <Text strong className={styles.totalValue}>
          {checkout ? <Money money={checkout.cost.totalAmount} /> : null}
        </Text>
      </Flex>
      {checkout.loyaltyEarning ? (
        <LoyaltyEarningLine earning={checkout.loyaltyEarning} />
      ) : null}
    </Flex>
  );
};

/**
 * What the order earns, in the server's words ("Нарахуємо +236 балів"). A guest is invited to
 * sign in for it in a highlighted box; without customer accounts a guest cannot earn, so nothing
 * is shown.
 */
export const LoyaltyEarningLine = ({ earning }: { earning: Checkout.LoyaltyEarning }) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { customerAccountsEnabled } = useCheckoutTheme();
  const auth = useCheckoutAuth();
  if (earning.state === 'AUTHENTICATION_REQUIRED') {
    if (!customerAccountsEnabled) return null;
    return (
      <Flex align="flex-start" gap={10} className={styles.invite}>
        <LoyaltyIcon size={20} />
        <Flex vertical gap={2}>
          <Text strong className={styles.earningText}>
            {earning.headline}
          </Text>
          {earning.description ? (
            <Text type="secondary" className={styles.earningText}>
              {earning.description}
            </Text>
          ) : null}
          {auth.status === 'anonymous' ? (
            <Button
              type="link"
              size="small"
              className={styles.signIn}
              loading={auth.pending}
              onClick={auth.onSignIn}
            >
              {t('loyalty-earning-sign-in')}
            </Button>
          ) : null}
        </Flex>
      </Flex>
    );
  }
  return (
    <Flex align="center" gap={6} wrap className={styles.earning}>
      <LoyaltyIcon size={14} />
      <Text type="secondary" className={styles.earningText}>
        {earning.headline}
      </Text>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // Every divider of the checkout is colorBorder, the color of its fields and cards.
  divider: css`
    &.ant-divider {
      margin: 0;
      border-color: ${token.colorBorder};
    }
  `,
  // The totals are a block of their own, apart from the promo codes and rewards above.
  root: css`
    padding-top: ${token.padding}px;
    border-top: 1px solid ${token.colorBorder};
  `,
  // The lines of the totals are a step over the content and under the total.
  lineLabel: css`
    font-size: ${token.fontSizeLG}px;
  `,
  lineValue: css`
    font-size: ${token.fontSizeLG}px;
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
    margin-top: -${token.marginXS}px;
  `,
  earning: css`
    margin-top: -${token.marginXXS}px;
  `,
  earningText: css`
    font-size: ${token.fontSizeSM}px;
  `,
  invite: css`
    padding: ${token.paddingSM}px ${token.padding}px;
    border: 1px solid ${token.colorPrimaryBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorPrimaryBg};
  `,
  signIn: css`
    align-self: flex-start;
    height: auto;
    padding: 0;
    text-decoration: underline;
  `,
  totalLabel: css`
    font-size: ${token.fontSizeXL}px;
  `,
  totalValue: css`
    font-size: ${token.fontSizeXL}px;
  `,
}));
