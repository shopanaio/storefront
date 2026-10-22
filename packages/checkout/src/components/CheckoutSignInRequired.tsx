'use client';

import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { PiLockSimple } from 'react-icons/pi';
import { AuthInline } from '@shopana/storefront-auth/ui';
import { useSaveCheckoutInput } from '#checkout/hooks/useCheckoutAuth';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';

/**
 * Sign-in in place of the sections (A1–A2), in the page: delivery and payment stay locked until
 * the buyer signs in.
 * - `required` (S7): the store requires an account; the cart stays and the account claims it
 *   after signing in;
 * - `expired` (S6): the session ended while the account checkout was open; it is not readable
 *   as a guest, so the buyer signs in again, told the session ended.
 */
export const CheckoutSignInRequired = ({
  brand,
}: {
  brand?: ReactNode;
  reason: 'required' | 'expired';
}) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { checkout } = useCheckoutData();
  const saveInput = useSaveCheckoutInput();
  const identity = checkout?.customerIdentity;
  return (
    <Flex vertical className={styles.column}>
      {brand}
      {/* The session-ended alert comes from the SDK session itself (S6). */}
      <AuthInline
        context="checkoutRequired"
        defaultIdentifier={{ email: identity?.email, phone: identity?.phone }}
        beforeSocial={saveInput}
      />
      {[t('delivery'), t('payment')].map((title) => (
        <section key={title} className={styles.locked} aria-label={title}>
          <Typography.Title level={3} className={styles.lockedTitle}>
            {title}
          </Typography.Title>
          <Typography.Text type="secondary" className={styles.lock}>
            <PiLockSimple aria-hidden />
            {t('available-after-sign-in')}
          </Typography.Text>
        </section>
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  column: css`
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: ${token.paddingXL}px ${token.padding}px;
    gap: ${token.marginLG}px;
  `,
  locked: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXS}px;
  `,
  lockedTitle: css`
    && {
      margin: 0;
      font-size: ${token.fontSizeXL}px;
      font-weight: ${token.fontWeightStrong};
      color: ${token.colorTextDisabled};
    }
  `,
  lock: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXXS + 2}px;
  `,
}));
