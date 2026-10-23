'use client';

import { Flex, Skeleton, Typography } from 'antd';
import { Banner } from '@shopana/storefront-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  useIsAuthenticated,
  useSignInPending,
} from '@shopana/storefront-sdk/modules/session/react';
import { useCartClaimed } from '@shopana/storefront-sdk/modules/cart/react';

/**
 * After a sign-in in the checkout (G4): while the account cart is attached, a placeholder of the
 * contact; once the account claimed the checkout, "Your account details are added to the order".
 */
export const AccountDataNotice = () => {
  const t = useTranslations('Checkout');
  const signInPending = useSignInPending();
  const authenticated = useIsAuthenticated();
  const [claimed, setClaimed] = useState(false);

  useCartClaimed(() => setClaimed(true));

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
    <Banner
      tone="success"
      title={t('account-data-added')}
      onDismiss={() => setClaimed(false)}
    />
  );
};
