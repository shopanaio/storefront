import { Flex, Skeleton } from 'antd';
import { useTranslations } from 'next-intl';
import { CheckoutColumns } from '#checkout/components/CheckoutColumns';
import { CheckoutSection } from '#checkout/components/common/CheckoutSection';
import { SectionTitle } from '#checkout/components/common/SectionTitle';
import { SummaryItem } from '#checkout/components/summary/SummaryItem';
import { SummaryTotals } from '#checkout/components/summary/SummaryTotals';
import { mapCheckoutToLoyaltyFormData } from '#checkout/sections/loyalty/mapper';
import { LoyaltySectionView } from '#checkout/sections/loyalty/components/Component';
import { mapCheckoutToPromoFormData } from '#checkout/sections/promo/mapper';
import { PromoSectionView } from '#checkout/sections/promo/components/Component';
import { Badge } from '#checkout/ui/Badge';
import { SummaryBlocks } from '#checkout/ui/summaryBlocks';
import type { Checkout } from '#checkout/types/entity';

/** A section of the form the story is not about: its title over a placeholder. */
const FormSection = ({ title, rows }: { title: string; rows: number }) => (
  <CheckoutSection title={title}>
    <Skeleton active={false} title={false} paragraph={{ rows }} />
  </CheckoutSection>
);

const noop = () => {};

/**
 * The checkout page with the order summary as the buyer sees it: the columns of the page, the
 * form on the left as placeholders, and on the right the order lines, the promo codes, the
 * loyalty block and the totals, in the order of the summary.
 */
export function CheckoutPageShell({
  checkout,
}: {
  checkout: Checkout.Checkout;
}) {
  const t = useTranslations('Checkout');
  return (
    <CheckoutColumns
      left={
        <>
          <strong>Storefront</strong>
          <FormSection title={t('contact')} rows={3} />
          <FormSection title={t('delivery')} rows={4} />
          <FormSection title={t('payment')} rows={2} />
        </>
      }
      right={
        <SummaryBlocks>
          <Flex vertical gap={12}>
            <Flex align="center" gap={8}>
              <SectionTitle>{t('order-summary')}</SectionTitle>
              <Badge count={checkout.totalQuantity} variant="primary" />
            </Flex>
            <Flex vertical gap={8}>
              {checkout.lines.map((line) => (
                <SummaryItem key={line.id} line={line} />
              ))}
            </Flex>
          </Flex>
          <PromoSectionView
            data={mapCheckoutToPromoFormData(checkout)}
            invalidate={noop}
          />
          <LoyaltySectionView
            data={mapCheckoutToLoyaltyFormData(checkout)}
            invalidate={noop}
          />
          <SummaryTotals checkout={checkout} />
        </SummaryBlocks>
      }
    />
  );
}
