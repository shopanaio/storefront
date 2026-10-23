'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AuthInline } from '@shopana/storefront-auth/ui';
import { usePointsLabel } from '#checkout/sections/loyalty/format';
import { formatMoney } from '#checkout/ui/Money';
import type { Checkout } from '#checkout/types/entity';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutSignIn } from '#checkout/context/CheckoutSignInContext';
import { CheckoutAuthUI, useCheckoutAuthFlowProps } from './CheckoutAuthUI';

/**
 * Sign-in in place of the contact (A1–A2), in the page of the checkout; the summary beside it
 * keeps the lines and the totals. One form for both cases of `useSignInRequired`: the store
 * requires an account (S7; the cart stays and the account claims it after signing in), or the
 * session ended while the account checkout was open (S6; the SDK session itself says so). Where
 * the order earns points, the form invites to sign in for them.
 *
 * "Log in" elsewhere on the page (the points the order earns) leads here: `requestSignIn()` of
 * the page scrolls to this form and focuses its field.
 */
export const CheckoutSignInRequired = () => {
  const { checkout } = useCheckoutData();
  const { inlineRef } = useCheckoutSignIn();
  const flowProps = useCheckoutAuthFlowProps();
  const earningInvite = useEarningInvite(checkout?.loyaltyEarning ?? null);
  return (
    <CheckoutAuthUI>
      <AuthInline
        ref={inlineRef}
        context="checkoutRequired"
        identifySubtitle={earningInvite}
        {...flowProps}
      />
    </CheckoutAuthUI>
  );
};

/**
 * What the order earns once the buyer signs in, when the loyalty program quoted it: "Sign in
 * to check out faster and get **+112 ₴ to the bonus account** for your order". None without an
 * estimate: the sign-in then says an account is required.
 */
function useEarningInvite(earning: Checkout.LoyaltyEarning | null): ReactNode {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const pointsLabel = usePointsLabel();
  if (!earning || earning.state !== 'AUTHENTICATION_REQUIRED') return null;
  const reward = earning.amount
    ? t('sign-in-required-earning-store-credit', {
        amount: formatMoney(locale, earning.amount),
      })
    : BigInt(earning.points) > 0n
      ? `+${pointsLabel(earning.points)}`
      : null;
  if (!reward) return null;
  return t.rich('sign-in-required-earning', {
    reward,
    b: (chunks) => <b>{chunks}</b>,
  });
}
