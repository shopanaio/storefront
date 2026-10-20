import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
import {
  focusAnchor,
  sectionAnchor,
  SUMMARY_ANCHOR,
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
  const checkoutId = checkout?.id ?? null;
  const notifications = checkout?.notifications;

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
        },
        {
          retryRenewal,
          closeRenewal: () => setRenewal('idle'),
          retryPlacement: requestSubmit,
          closePlacement: resetPlacement,
          closeSaveError: clearSaveError,
          // Placed elsewhere: this cart can no longer be used; without it the page goes home.
          goHome: () => cleanup(checkoutId),
          openCart,
          focusSection: (section) => focusAnchor(sectionAnchor(section)),
          focusSummary: () => focusAnchor(SUMMARY_ANCHOR, { focus: false }),
          dismiss,
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
      openCart,
      dismiss,
      t,
    ]
  );
}
