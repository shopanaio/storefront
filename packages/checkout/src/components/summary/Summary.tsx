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
import { SummaryBlocks } from '#checkout/ui/summaryBlocks';
import { SectionRenderer } from '#checkout/infra/SectionRenderer';
import { SectionId } from '#checkout/state/interface';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { useMediaQuery } from '#checkout/ui/useMediaQuery';
import { breakpoints } from '#checkout/ui/breakpoints';
import { ShipmentPlate } from '#checkout/sections/delivery/components/ShipmentPlate';

interface Prop {
  checkout: Checkout.Checkout;
}

export const Summary = ({ checkout }: Prop) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();

  const { CartDrawer, useOpenCart } = useCheckoutTheme();
  const openCartDrawer = useOpenCart();
  const [isExpanded, setIsExpanded] = useState(false);
  // Below lg the summary goes under the form (CheckoutColumns); there its lines fold.
  const stacked = useMediaQuery(`(max-width: ${breakpoints.lg - 0.05}px)`);

  const undeliverable = new Set(useUndeliverableLines().map((line) => line.id));
  const lines = checkout?.lines ?? [];
  const visibleLines = isExpanded ? lines : lines.slice(0, 5);
  const hasHidden = lines.length > 5;

  return (
    <SummaryBlocks>
      <Flex vertical gap={12}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={8}>
            <SectionTitle>{t('order-summary')}</SectionTitle>
            <Badge count={checkout?.totalQuantity} variant="primary" />
          </Flex>
          {openCartDrawer ? (
            <Button
              color="default"
              variant="text"
              onClick={() => openCartDrawer()}
              icon={<TbShoppingCart size={20} />}
            />
          ) : null}
        </Flex>
        {/* Under the form the lines fold into their pictures, as a shipment does. */}
        {stacked ? (
          <ShipmentPlate
            lines={lines}
            undeliverable={undeliverable}
            defaultExpanded={undeliverable.size > 0}
          />
        ) : (
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
                  {isExpanded ? t('summary-show-less') : t('summary-show-more')}
                </Button>
              </div>
            ) : null}
          </Flex>
        )}
      </Flex>
      <SectionRenderer slug={SectionId.Promo} />
      <SectionRenderer slug={SectionId.Loyalty} />
      <SummaryTotals checkout={checkout} />
      <CartDrawer />
    </SummaryBlocks>
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
