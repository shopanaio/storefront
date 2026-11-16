import { useEffect, useRef } from 'react';
import { useCheckoutReadiness } from '#checkout/hooks/useCheckoutReadiness';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { CheckoutEvent, onCheckoutEvent } from '#checkout/state/checkoutBus';
import {
  computeMissingRequiredSections,
  useCheckoutStore,
} from '#checkout/state/checkoutStore';
import { firstSectionToFill } from '#checkout/state/banners/banners';
import { visibleBlockingIssues } from '#checkout/state/banners/messages';
import { focusAnchor, sectionAnchor } from '#checkout/ui/focusAnchor';

/**
 * Each press of "place order" brings into view the first section the buyer has to fill in, the
 * one the checkout banner names. Mounted once per page: the actions are rendered twice.
 */
export function useScrollToFirstError(): void {
  const readiness = useCheckoutReadiness();
  const undeliverableCount = useUndeliverableLines().length;
  const latest = useRef({ readiness, undeliverableCount });
  latest.current = { readiness, undeliverableCount };

  useEffect(
    () =>
      onCheckoutEvent(CheckoutEvent.SubmitRequested, () => {
        const { readiness, undeliverableCount } = latest.current;
        if (!readiness || readiness.expired) return;
        const section = firstSectionToFill(
          visibleBlockingIssues(readiness.blocking, undeliverableCount),
          computeMissingRequiredSections(useCheckoutStore.getState())
        );
        if (section) focusAnchor(sectionAnchor(section), { focus: false });
      }),
    []
  );
}
