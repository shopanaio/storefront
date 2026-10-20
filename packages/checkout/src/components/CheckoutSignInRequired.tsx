'use client';

import { Button, Result } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { PlacementScreen } from '#checkout/components/result/PlacementScreen';
import { useCheckoutAuth } from '#checkout/hooks/useCheckoutAuth';

/**
 * Sign-in in place of the sections:
 * - `required` (S7): the store requires an account; the cart stays and the account claims it
 *   after signing in;
 * - `expired` (S6): the session ended while the account checkout was open; it is not readable
 *   as a guest, so the buyer signs in again instead of seeing an empty cart.
 */
export const CheckoutSignInRequired = ({
  brand,
  reason,
}: {
  brand?: ReactNode;
  reason: 'required' | 'expired';
}) => {
  const t = useTranslations('Checkout');
  const { onSignIn, pending, status } = useCheckoutAuth();
  return (
    <PlacementScreen brand={brand}>
      <Result
        status={reason === 'expired' ? 'warning' : 'info'}
        title={t(reason === 'expired' ? 'session-expired' : 'sign-in-required')}
        extra={
          <Button
            type="primary"
            size="large"
            loading={pending || status === 'loading'}
            onClick={onSignIn}
          >
            {t('log-in')}
          </Button>
        }
      />
    </PlacementScreen>
  );
};
