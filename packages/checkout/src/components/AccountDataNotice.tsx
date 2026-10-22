'use client';

import { Alert, Flex, Skeleton, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  useIsAuthenticated,
  useSignInPending,
} from '@shopana/storefront-sdk/modules/session/react';
import { CART_CLAIMED_EVENT } from '@shopana/storefront-sdk/modules/cart/react/providers/AccountCartSync';

/**
 * After a sign-in in the checkout (G4): while the account cart is attached, a placeholder of the
 * contact; once the account claimed the checkout, "Your account details are added to the order".
 */
export const AccountDataNotice = () => {
  const t = useTranslations('Checkout');
  const signInPending = useSignInPending();
  const authenticated = useIsAuthenticated();
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const onClaimed = () => setClaimed(true);
    window.addEventListener(CART_CLAIMED_EVENT, onClaimed);
    return () => window.removeEventListener(CART_CLAIMED_EVENT, onClaimed);
  }, []);

  if (authenticated && signInPending) {
    return (
      <Flex vertical gap={8} aria-busy="true">
        <Skeleton.Button active block size="large" />
        <Typography.Text type="secondary" role="status">
          {t('account-data-loading')}
        </Typography.Text>
      </Flex>
    );
  }
  if (!authenticated || !claimed) return null;
  return (
    <Alert
      type="info"
      showIcon
      role="status"
      title={t('account-data-added')}
      closable
      onClose={() => setClaimed(false)}
    />
  );
};
