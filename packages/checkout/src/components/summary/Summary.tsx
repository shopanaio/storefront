import type { ReactNode } from 'react';
import { useCheckoutTheme } from '#checkout/theme';
import type { Checkout } from '#checkout/types/entity';
import { SummaryBlocks } from '#checkout/ui/summaryBlocks';
import { SectionRenderer } from '#checkout/infra/SectionRenderer';
import { SectionId } from '#checkout/state/interface';
import { SummaryLines } from './SummaryLines';
import { SummaryTotals } from './SummaryTotals';

interface Prop {
  checkout: Checkout.Checkout;
  /** Whether the lines open the summary; on a phone they lead the page instead. */
  withLines?: boolean;
  /** Shown right over the totals, such as the order comment on a phone. */
  beforeTotals?: ReactNode;
}

export const Summary = ({ checkout, withLines = true, beforeTotals }: Prop) => {
  const { CartDrawer } = useCheckoutTheme();

  return (
    <SummaryBlocks>
      {withLines ? <SummaryLines checkout={checkout} /> : null}
      <SectionRenderer slug={SectionId.Promo} />
      <SectionRenderer slug={SectionId.Loyalty} />
      {beforeTotals}
      <SummaryTotals checkout={checkout} />
      <CartDrawer />
    </SummaryBlocks>
  );
};
