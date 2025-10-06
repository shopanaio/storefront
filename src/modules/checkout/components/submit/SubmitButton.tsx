'use client';

import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useHasActiveOperations } from '@src/modules/checkout/state/selectors';

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
 * Disabled when there are active operations (mutations in-flight).
 */
export const SubmitButton = ({ onClick }: SubmitButtonProps) => {
  const t = useTranslations('Checkout');
  const hasActiveOperations = useHasActiveOperations();

  return (
    <Button
      style={{ height: 48 }}
      type="primary"
      size="large"
      htmlType="submit"
      onClick={onClick}
      loading={hasActiveOperations}
      disabled={hasActiveOperations}
    >
      {t('confirm-order')}
    </Button>
  );
};

export default SubmitButton;
