import { Flex, Typography, Button, Badge } from 'antd';
import { createStyles } from 'antd-style';
import { SummaryItem } from './SummaryItem';
import { useTranslations } from 'next-intl';
import { TbShoppingCart } from 'react-icons/tb';
import { useState } from 'react';
import { Money } from '@src/components/UI/Price/Money';
import { CartDrawer } from '@src/components/Cart/CartDrawerDynamic';
import type { Checkout } from '@src/modules/checkout/types/entity';
import { SectionTitle } from '@src/modules/checkout/components/common/SectionTitle';
import { SectionRenderer } from '@src/modules/checkout/infra/loaders/SectionRenderer';
import { SectionId } from '@src/modules/checkout/state/interface';

const { Text } = Typography;

interface Prop {
  checkout: Checkout.Checkout;
}

export const Summary = ({ checkout }: Prop) => {
  const t = useTranslations('Checkout');
  const tListing = useTranslations('Listing');
  const { styles } = useStyles();

  const [, setCartDrawerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const openCartDrawer = () => setCartDrawerOpen(true);

  const lines = checkout?.lines ?? [];
  const visibleLines = isExpanded ? lines : lines.slice(0, 5);
  const hasHidden = lines.length > 5;

  return (
    <>
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={8}>
          <SectionTitle>{t('order-summary')}</SectionTitle>
          <Badge count={checkout?.totalQuantity} color="blue" />
        </Flex>
        <Button
          color="default"
          variant="text"
          onClick={() => openCartDrawer()}
          icon={<TbShoppingCart size={20} />}
        />
      </Flex>
      <Flex vertical gap={8}>
        {visibleLines.map((line) => (
          <SummaryItem key={line.id} line={line} />
        ))}
        {hasHidden ? (
          <div>
            <Button
              className={styles.confirmLinkBtn}
              type="link"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? tListing('show-less') : tListing('show-more')}
            </Button>
          </div>
        ) : null}
      </Flex>
      <SectionRenderer slug={SectionId.Promo} />
      <Flex vertical gap={12}>
        <Flex justify="space-between">
          <Text className={styles.summaryRow} strong>
            {t('subtotal')}
          </Text>
          <Text className={styles.summaryRow} strong>
            <Money money={checkout.cost.subtotalAmount} />
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text className={styles.summaryRow} strong>
            {t('shipping')}
          </Text>
          <Text className={styles.summaryRow} strong>
            {checkout?.cost?.totalShippingAmount ? (
              <Money money={checkout.cost.totalShippingAmount} />
            ) : (
              ''
            )}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text className={styles.summaryRow} strong>
            {t('tax')}
          </Text>
          <Text className={styles.summaryRow} strong>
            {checkout?.cost?.totalTaxAmount ? (
              <Money money={checkout.cost.totalTaxAmount} />
            ) : (
              ''
            )}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text className={styles.summaryTotal}>{t('total')}</Text>
          <Text className={styles.summaryTotal}>
            {checkout ? <Money money={checkout.cost.totalAmount} /> : null}
          </Text>
        </Flex>
      </Flex>
      <CartDrawer />
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  divider: css`
    margin: 0;
  `,
  placeholderIcon: css`
    color: ${token.colorTextPlaceholder};
  `,
  summaryRow: css`
    font-size: ${token.fontSizeLG}px;
  `,
  summaryTotal: css`
    font-weight: 900;
    font-size: ${token.fontSizeXL}px;
  `,
  confirmLinkBtn: css`
    padding: 0;
    text-decoration: underline;
  `,
}));
