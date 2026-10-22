'use client';

import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useHasActiveOperations } from '#checkout/state/selectors';
import { useIsPlacementBusy } from '#checkout/state/placement/placementStore';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { Money } from '#checkout/ui/Money';

export interface SubmitButtonProps {
  /**
   * Optional click handler. When used within a form with htmlType="submit",
   * form submission will be triggered regardless of this handler.
   */
  onClick?: () => void;
}

/**
 * Submit button for the checkout form. Uses large primary AntD button
 * and localized label from Checkout namespace.
 * A click during an input save starts placement, which waits for that save (BR-awbl).
 * Loading and disabled for the whole placement attempt (1.12),
 * while some lines cannot be delivered to the address (R7), and once the checkout expired
 * (it is being replaced, R5). A checkout that is not ready yet keeps the button pressable, so
 * that pressing it tells the buyer what is missing; it is not placed until it is READY.
 */
export const SubmitButton = ({ onClick }: SubmitButtonProps) => {
  const t = useTranslations('Checkout');
  const hasActiveOperations = useHasActiveOperations();
  const placementBusy = useIsPlacementBusy();
  const blocked = useUndeliverableLines().length > 0;
  const expired = useCheckoutReadiness()?.expired ?? false;
  // What the buyer pays, after the label, as the checkout button of the cart shows it.
  const total = useCheckoutData().checkout?.cost.totalAmount;

  return (
    <Button
      style={{ height: 48 }}
      type="primary"
      size="large"
      htmlType="submit"
      onClick={onClick}
      aria-busy={hasActiveOperations || placementBusy}
      loading={placementBusy}
      disabled={placementBusy || blocked || expired}
    >
      {t('confirm-order')}
      {total ? (
        <>
          {' • '}
          <Money money={total} />
        </>
      ) : null}
    </Button>
  );
};

export default SubmitButton;
