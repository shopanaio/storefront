import { Flex, Button } from 'antd';
import { Badge } from '#checkout/ui/Badge';
import { createStyles } from 'antd-style';
import { SummaryItem } from './SummaryItem';
import { SummaryTotals } from './SummaryTotals';
import { useTranslations } from 'next-intl';
import { TbShoppingCart } from 'react-icons/tb';
import { useState } from 'react';
import { useCheckoutTheme } from '#checkout/theme';
import type { Checkout } from '#checkout/types/entity';
import { SectionTitle } from '#checkout/components/common/SectionTitle';
import { SectionRenderer } from '#checkout/infra/SectionRenderer';
import { SectionId } from '#checkout/state/interface';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';

interface Prop {
  checkout: Checkout.Checkout;
}

export const Summary = ({ checkout }: Prop) => {
  const t = useTranslations('Checkout');
  const tListing = useTranslations('Listing');
  const { styles } = useStyles();

  const { CartDrawer, useOpenCart } = useCheckoutTheme();
  const openCartDrawer = useOpenCart();
  const [isExpanded, setIsExpanded] = useState(false);

  const undeliverable = new Set(useUndeliverableLines().map((line) => line.id));
  const lines = checkout?.lines ?? [];
  const visibleLines = isExpanded ? lines : lines.slice(0, 5);
  const hasHidden = lines.length > 5;

  return (
    <>
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={8}>
          <SectionTitle>{t('order-summary')}</SectionTitle>
          <Badge count={checkout?.totalQuantity} variant="primary" />
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
          <SummaryItem
            key={line.id}
            line={line}
            undeliverable={undeliverable.has(line.id)}
          />
        ))}
        {hasHidden ? (
          <div>
            <Button
              className={styles.confirmLinkBtn}
              variant="link"
              color="primary"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? tListing('show-less') : tListing('show-more')}
            </Button>
          </div>
        ) : null}
      </Flex>
      <SectionRenderer slug={SectionId.Promo} />
      <SectionRenderer slug={SectionId.Loyalty} />
      <SummaryTotals checkout={checkout} />
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
  confirmLinkBtn: css`
    padding: 0;
    text-decoration: underline;
  `,
}));
