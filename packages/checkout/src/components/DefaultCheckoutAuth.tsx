'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { CheckoutAuthProps } from '#checkout/theme';
import { mq } from '#checkout/ui/breakpoints';

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
  const { styles, cx } = useStyles();
  if (status === 'authenticated' && user) {
    return (
      <Flex
        className={cx(styles.signedIn, className)}
        align="center"
        justify="space-between"
        gap={8}
      >
        <Typography.Text type="secondary" className={styles.email} ellipsis>
          {t('signed-in-as', { email: user.identifier })}
        </Typography.Text>
        <Button
          className={styles.logOut}
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
      variant="link"
      color="primary"
      loading={pending || status === 'loading'}
      onClick={onSignIn}
    >
      {t('log-in')}
    </Button>
  );
};

const useStyles = createStyles(({ css }) => ({
  // On a phone always a row of its own under the title; beside the form, the rest of the header
  // row. "Log out" is at its end.
  signedIn: css`
    flex: 1 1 100%;
    min-width: 0;

    ${mq.lg} {
      flex: 1 1 auto;
    }
  `,
  // Short of room the address is cut, and "Log out" stays on the line.
  email: css`
    min-width: 0;
  `,
  logOut: css`
    flex: none;
    padding-inline: 0;
  `,
}));
