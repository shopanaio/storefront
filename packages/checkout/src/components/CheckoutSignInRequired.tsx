'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AuthInline, AuthUIProvider } from '@shopana/storefront-auth/ui';
import { usePointsLabel } from '#checkout/sections/loyalty/format';
import { formatMoney } from '#checkout/ui/Money';
import type { Checkout } from '#checkout/types/entity';
import { useSaveCheckoutInput } from '#checkout/hooks/useCheckoutAuth';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useAuthDialogStore } from '#checkout/state/authDialogStore';
import { CHECKOUT_AUTH_COMPONENTS } from '#checkout/components/notices/AuthConsent';

/**
 * Sign-in in place of the contact (A1–A2), in the page of the checkout; the summary beside it
 * keeps the lines and the totals.
 * - `required` (S7): the store requires an account; the cart stays and the account claims it
 *   after signing in;
 * - `expired` (S6): the session ended while the account checkout was open; it is not readable
 *   as a guest, so the buyer signs in again, told the session ended.
 */
export const CheckoutSignInRequired = () => {
  const { checkout } = useCheckoutData();
  const saveInput = useSaveCheckoutInput();
  const identity = checkout?.customerIdentity;
  const earningInvite = useEarningInvite(checkout?.loyaltyEarning ?? null);
  const root = useRef<HTMLDivElement>(null);
  const signInAsked = useAuthDialogStore((state) => state.open);
  const setSignInAsked = useAuthDialogStore((state) => state.setOpen);

  // "Log in" elsewhere on the page (the points the order earns) leads to this form: the
  // checkout has no sign-in drawer while the sign-in is on the page.
  useEffect(() => {
    if (!signInAsked) return;
    setSignInAsked(false);
    root.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // The phone or email field, past the method tabs and the country; a button without one.
    const target =
      root.current?.querySelector<HTMLElement>(
        'input:not([type="radio"]):not([type="hidden"])'
      ) ?? root.current?.querySelector<HTMLElement>('button');
    target?.focus({ preventScroll: true });
  }, [signInAsked, setSignInAsked]);

  return (
    <div ref={root}>
      {/* The session-ended alert comes from the SDK session itself (S6). */}
      {/* The consent opens the store's policy over the checkout, as the submit notice does. */}
      <AuthUIProvider components={CHECKOUT_AUTH_COMPONENTS}>
        <AuthInline
          context="checkoutRequired"
          defaultIdentifier={{ email: identity?.email, phone: identity?.phone }}
          beforeSocial={saveInput}
          identifySubtitle={earningInvite}
        />
      </AuthUIProvider>
    </div>
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
    ? t('result-loyalty-earned-store-credit', {
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
