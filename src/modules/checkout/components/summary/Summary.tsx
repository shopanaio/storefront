import { Flex, Button } from 'antd';
import { Badge } from '@src/components/UI/Badge';
import { createStyles } from 'antd-style';
import { SummaryItem } from './SummaryItem';
import { SummaryTotals } from './SummaryTotals';
import { useTranslations } from 'next-intl';
import { TbShoppingCart } from 'react-icons/tb';
import { useState } from 'react';
import { CartDrawer } from '@src/templates/cart/sections/CartDrawer/dynamic';
import type { Checkout } from '@src/modules/checkout/types/entity';
import { SectionTitle } from '@src/modules/checkout/components/common/SectionTitle';
import { SectionRenderer } from '@src/modules/checkout/infra/SectionRenderer';
import { SectionId } from '@src/modules/checkout/state/interface';

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
          <SummaryItem key={line.id} line={line} />
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
