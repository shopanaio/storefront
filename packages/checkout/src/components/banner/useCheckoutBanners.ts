import { useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useSubmitAttempted } from '#checkout/hooks/useSubmitAttempted';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';
import { useMissingRequiredSections } from '#checkout/state/selectors';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { useRenewalStore } from '#checkout/state/renewal';
import {
  usePlacementPhase,
  usePlacementStore,
} from '#checkout/state/placement/placementStore';
import {
  UNDELIVERABLE_REMOVE_ERROR_KEY,
  useBannerStore,
} from '#checkout/state/banners/bannerStore';
import { collectBanners } from '#checkout/state/banners/banners';
import type { BannerItem } from '#checkout/state/banners/banners';
import { useCheckoutTheme } from '#checkout/theme';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useCheckoutAuth } from '#checkout/hooks/useCheckoutAuth';
import {
  useLoyaltyWrites,
} from '#checkout/sections/loyalty/selection';
import { usePointsLabel } from '#checkout/sections/loyalty/format';
import { formatMoney } from '#checkout/ui/Money';
import { useLoyaltyAccount } from '#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount';
import {
  focusAnchor,
  sectionAnchor,
  LINES_ANCHOR,
} from '#checkout/ui/focusAnchor';

/** Messages of the checkout banner, most important first. */
export function useCheckoutBanners(): BannerItem[] {
  const t = useTranslations('Checkout');
  const { checkout } = useCheckoutData();
  const readiness = useCheckoutReadiness();
  const attempted = useSubmitAttempted();
  const missingSections = useMissingRequiredSections();
  const undeliverableCount = useUndeliverableLines().length;
  const requestSubmit = useCheckoutStore((state) => state.requestSubmit);
  const renewal = useRenewalStore((state) => state.state);
  const retryRenewal = useRenewalStore((state) => state.retry);
  const setRenewal = useRenewalStore((state) => state.setState);
  const placement = usePlacementPhase();
  const resetPlacement = usePlacementStore((state) => state.reset);
  const saveErrors = useBannerStore((state) => state.saveErrors);
  const dismissed = useBannerStore((state) => state.dismissed);
  const dismiss = useBannerStore((state) => state.dismiss);
  const clearSaveError = useBannerStore((state) => state.clearSaveError);
  const cleanup = useDefaultCartCleanup();
  const theme = useCheckoutTheme();
  const openCart = theme.useOpenCart();
  const homePath = theme.useHomePath();
  const checkoutId = checkout?.id ?? null;
  const notifications = checkout?.notifications;
  const locale = useLocale();
  const pointsLabel = usePointsLabel();
  const api = useCheckoutApi();
  const { onSignIn } = useCheckoutAuth();
  const loyaltyBusy = useLoyaltyWrites((state) => state.running > 0);
  const redemption = checkout?.loyaltyRedemption ?? null;
  const selectedSource = checkout?.loyaltySelection?.source ?? null;
  const loyalty = useMemo(
    () => ({
      redemption,
      selectedSource,
      reducedTo: redemption
        ? redemption.source === 'POINTS' && redemption.points !== null
          ? pointsLabel(redemption.points)
          : formatMoney(locale, redemption.discount)
        : null,
      busy: loyaltyBusy,
    }),
    [redemption, selectedSource, pointsLabel, locale, loyaltyBusy]
  );
  // The reward the buyer chose, also when it could not be applied: giving it up removes it.
  const rewardId = checkout?.loyaltySelection?.rewardId ?? null;
  const { account: loyaltyAccount } = useLoyaltyAccount();
  const rewardVoucher =
    loyaltyAccount?.rewards.find((reward) => reward.id === rewardId)?.voucherCode ?? null;

  // A failed removal of lines that cannot be delivered ends with them (another address).
  useEffect(() => {
    if (undeliverableCount === 0) clearSaveError(UNDELIVERABLE_REMOVE_ERROR_KEY);
  }, [undeliverableCount, clearSaveError]);

  return useMemo(
    () =>
      collectBanners(
        {
          renewal,
          placement,
          attempted,
          readiness,
          missingSections,
          undeliverableCount,
          saveErrors,
          notifications: notifications ?? [],
          dismissed,
          loyalty,
        },
        {
          retryRenewal,
          closeRenewal: () => setRenewal('idle'),
          retryPlacement: requestSubmit,
          closePlacement: resetPlacement,
          closeSaveError: clearSaveError,
          // Placed elsewhere: this cart can no longer be used; without it the page goes home.
          goHome: () => cleanup(checkoutId),
          homePath,
          openCart,
          focusSection: (section) => focusAnchor(sectionAnchor(section)),
          focusSummary: () => focusAnchor(LINES_ANCHOR, { focus: false }),
          dismiss,
          // A failed write is reported by its own banner; the action needs no handling here.
          dropRedemption: () => void api.setLoyaltyRedemption(null).catch(() => undefined),
          dropReward: () =>
            void api
              .setLoyaltyReward(
                null,
                rewardId ? { id: rewardId, voucherCode: rewardVoucher } : null
              )
              .catch(() => undefined),
          refreshLoyalty: () => void api.refreshLoyalty().catch(() => undefined),
          signIn: onSignIn,
        },
        t
      ),
    [
      renewal,
      placement,
      attempted,
      readiness,
      missingSections,
      undeliverableCount,
      saveErrors,
      notifications,
      dismissed,
      retryRenewal,
      setRenewal,
      requestSubmit,
      resetPlacement,
      clearSaveError,
      cleanup,
      checkoutId,
      homePath,
      openCart,
      dismiss,
      loyalty,
      api,
      rewardId,
      rewardVoucher,
      onSignIn,
      t,
    ]
  );
}
