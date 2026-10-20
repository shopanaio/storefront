import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useSubmitAttempted } from '#checkout/hooks/useSubmitAttempted';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';
import { useMissingRequiredSections } from '#checkout/state/selectors';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { useRenewalStore } from '#checkout/state/renewal';
import { usePlacementPhase } from '#checkout/state/placement/placementStore';
import { useBannerStore } from '#checkout/state/banners/bannerStore';
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
  const saveErrors = useBannerStore((state) => state.saveErrors);
  const dismissed = useBannerStore((state) => state.dismissed);
  const dismiss = useBannerStore((state) => state.dismiss);
  const cleanup = useDefaultCartCleanup();
  const theme = useCheckoutTheme();
  const openCart = theme.useOpenCart();
  const checkoutId = checkout?.id ?? null;
  const notifications = checkout?.notifications;

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
      cleanup,
      checkoutId,
      openCart,
      dismiss,
      t,
    ]
  );
}
