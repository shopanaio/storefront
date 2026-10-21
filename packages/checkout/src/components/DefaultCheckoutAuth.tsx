'use client';

import { Button, Flex, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import type { CheckoutAuthProps } from '#checkout/theme';

/**
 * The checkout's own sign-in control: "Log in" for a guest, "Signed in as" with "Log out" for a
 * signed-in buyer. A theme replaces it with `Auth` of its adapter.
 */
export const DefaultCheckoutAuth = ({
  className,
  status,
  user,
  pending,
  onSignIn,
  onSignOut,
}: CheckoutAuthProps) => {
  const t = useTranslations('Checkout');
  if (status === 'authenticated' && user) {
    return (
      <Flex className={className} align="center" gap={8} wrap>
        <Typography.Text type="secondary">
          {t('signed-in-as', { email: user.email })}
        </Typography.Text>
        <Button
          size="large"
          variant="link"
          color="primary"
          loading={pending}
          onClick={onSignOut}
        >
          {t('log-out')}
        </Button>
      </Flex>
    );
  }
  return (
    <Button
      className={className}
      size="large"
      variant="link"
      color="primary"
      loading={pending || status === 'loading'}
      onClick={onSignIn}
    >
      {t('log-in')}
    </Button>
  );
};
