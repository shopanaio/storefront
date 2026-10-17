'use client';

import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useHasActiveOperations } from '#checkout/state/selectors';
import { useIsPlacementBusy } from '#checkout/state/placement/placementStore';

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
 * Loading while mutations are in flight; disabled for the whole placement attempt (1.12).
 */
export const SubmitButton = ({ onClick }: SubmitButtonProps) => {
  const t = useTranslations('Checkout');
  const hasActiveOperations = useHasActiveOperations();
  const placementBusy = useIsPlacementBusy();

  return (
    <Button
      style={{ height: 48 }}
      type="primary"
      size="large"
      htmlType="submit"
      onClick={onClick}
      loading={hasActiveOperations || placementBusy}
      disabled={placementBusy}
    >
      {t('confirm-order')}
    </Button>
  );
};

export default SubmitButton;
