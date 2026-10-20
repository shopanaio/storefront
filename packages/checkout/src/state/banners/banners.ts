import type { BannerTone } from '#checkout/ui/banner/tones';
import type { BannerAction } from '#checkout/ui/banner/CheckoutBanner';
import { SectionId } from '#checkout/state/interface';
import type { RenewalState } from '#checkout/state/renewal';
import type { PlacementPhase } from '#checkout/state/placement/placementStore';
import { issueSection } from '#checkout/state/issueSections';
import { placementErrorMessageKey } from '#checkout/components/result/placementMessages';
import type { Checkout } from '#checkout/types/entity';
import { issueMessage, issueText, visibleBlockingIssues } from './messages';
import {
  classifyLoyaltyIssue,
  isLoyaltyIssue,
  issueSource,
  redemptionIssueMessageKey,
  type LoyaltyIssue,
} from '#checkout/sections/loyalty/issues';
import type { SaveError } from './bannerStore';

/**
 * Order of the checkout banners: only the most important one is on screen, the rest are behind
 * its counter.
 */
export enum BannerPriority {
  /** The checkout is placed elsewhere, expired, or being replaced. */
  Closed = 0,
  /** The payment failed or waits for the buyer at the provider. */
  Placement = 1,
  /** Something blocks the order: an unfilled section, an issue, lines that cannot be delivered. */
  Blocking = 2,
  /**
   * The last placement was rejected. Below the blocking problems: once there are any, they say
   * what to fix before pressing the button again.
   */
  Rejected = 3,
  /** A save of the buyer's input failed. */
  SaveError = 4,
  /** The order changed on its own: stock, prices, warnings of the calculation. */
  Change = 5,
}

export interface BannerItem {
  /** Stable while the banner's cause lasts; a dismissed banner is remembered by it. */
  id: string;
  priority: BannerPriority;
  tone: BannerTone;
  title: string;
  description?: string;
  action?: BannerAction;
  /** Closing it is up to the buyer; critical banners stay until their problem is solved. */
  onDismiss?: () => void;
}

export interface BannerInput {
  renewal: RenewalState;
  placement: PlacementPhase;
  /** The buyer has pressed "place order" on this page. */
  attempted: boolean;
  readiness: {
    canPlace: boolean;
    expired: boolean;
    blocking: Checkout.Issue[];
    notices: Checkout.Issue[];
  } | null;
  missingSections: SectionId[];
  undeliverableCount: number;
  saveErrors: SaveError[];
  notifications: Checkout.Notification[];
  /** Ids of the banners the buyer closed. */
  dismissed: ReadonlySet<string>;
  loyalty: LoyaltyBannerInput;
}

export interface LoyaltyBannerInput {
  redemption: Checkout.LoyaltyRedemption | null;
  /** Source the buyer chose last, for an issue whose redemption the API dropped. */
  intent: Checkout.LoyaltySource | null;
  /** What the redemption was reduced to, ready to show ("350 балів", "₴80"). */
  reducedTo: string | null;
  /** A loyalty write is running: the banner action waits for it. */
  busy: boolean;
}

export interface BannerHandlers {
  retryRenewal: (() => void) | null;
  closeRenewal: () => void;
  /** Presses "place order" again. */
  retryPlacement: () => void;
  /** Forgets the rejected placement, so its banner goes. */
  closePlacement: () => void;
  /** Forgets a failed save the buyer may close. */
  closeSaveError: (key: string) => void;
  goHome: () => void;
  openCart: () => void;
  focusSection: (section: SectionId) => void;
  focusSummary: () => void;
  dismiss: (id: string) => void;
  /** Stops paying with points or store credit, keeping the reward. */
  dropRedemption: () => void;
  /** Gives up the reward, keeping the points or store credit. */
  dropReward: () => void;
  /** Sends the loyalty selection again and reads the account again. */
  refreshLoyalty: () => void;
  signIn: () => void;
}

type Translate = (
  key: string,
  values?: Record<string, string | number>
) => string;

/** Sections in the order of the page. */
const SECTION_ORDER: SectionId[] = [
  SectionId.Contact,
  SectionId.Address,
  SectionId.Delivery,
  SectionId.Recipient,
  SectionId.Payment,
  SectionId.Comment,
  SectionId.Promo,
  SectionId.Loyalty,
];

const STOCK_CODES = new Set<Checkout.NotificationCode>([
  'OUT_OF_STOCK',
  'NOT_ENOUGH_STOCK',
  'ITEM_UNAVAILABLE',
]);

const CLOSED_CODES = new Set(['CHECKOUT_ABANDONED', 'CHECKOUT_EXPIRED']);

/**
 * Every message of the checkout level, most important first (the rules of the checkout banner):
 * the checkout is closed → the payment or placement failed → something blocks the order →
 * a save failed → the order changed. Details of a section stay in the section.
 */
export function collectBanners(
  input: BannerInput,
  handlers: BannerHandlers,
  t: Translate
): BannerItem[] {
  const items: BannerItem[] = [];
  const retry: BannerAction = {
    label: t('banner-retry'),
    onClick: handlers.retryPlacement,
  };
  const goTo = (section: SectionId): BannerAction => ({
    label: t(section === SectionId.Loyalty ? 'loyalty-banner-go' : 'banner-go-to'),
    onClick: () => handlers.focusSection(section),
  });
  const review: BannerAction = {
    label: t('banner-review'),
    onClick: handlers.focusSummary,
  };
  const dismissible = (item: Omit<BannerItem, 'onDismiss'>) => {
    if (!input.dismissed.has(item.id)) {
      items.push({ ...item, onDismiss: () => handlers.dismiss(item.id) });
    }
  };

  // Closed checkout.
  if (input.renewal === 'failed') {
    items.push({
      id: 'renewal-failed',
      priority: BannerPriority.Closed,
      tone: 'critical',
      title: t('checkout-renew-failed'),
      action: handlers.retryRenewal
        ? { label: t('banner-retry'), onClick: handlers.retryRenewal }
        : undefined,
    });
  } else if (input.renewal === 'renewing') {
    items.push({
      id: 'renewing',
      priority: BannerPriority.Closed,
      tone: 'action',
      title: t('checkout-renewing'),
    });
  } else if (input.renewal === 'renewed') {
    items.push({
      id: 'renewed',
      priority: BannerPriority.Closed,
      tone: 'action',
      title: t('checkout-renewed-title'),
      description: t('checkout-renewed-description'),
      action: goTo(SectionId.Delivery),
      onDismiss: handlers.closeRenewal,
    });
  }

  // Payment and placement.
  const phase = input.placement;
  if (phase.name === 'payment-failed') {
    items.push({
      id: 'payment-failed',
      priority: BannerPriority.Placement,
      tone: 'critical',
      title: t('payment-failed-title'),
      description: t('payment-failed-description'),
      action: retry,
    });
  } else if (phase.name === 'payment-incomplete') {
    items.push({
      id: 'payment-incomplete',
      priority: BannerPriority.Placement,
      tone: 'action',
      title: t('payment-incomplete'),
      action: { label: t('continue-payment'), href: phase.url },
    });
  } else if (phase.name === 'rejected') {
    const key = placementErrorMessageKey(phase.code);
    const id = `rejected:${phase.code}`;
    if (phase.code === 'CHECKOUT_ALREADY_PLACED') {
      items.push({
        id,
        priority: BannerPriority.Closed,
        tone: 'critical',
        title: t(key),
        action: { label: t('go-home'), onClick: handlers.goHome },
      });
    } else if (CLOSED_CODES.has(phase.code)) {
      items.push({
        id,
        priority: BannerPriority.Closed,
        tone: 'critical',
        title: t(key),
        action: { label: t('banner-open-cart'), onClick: handlers.openCart },
      });
    } else {
      // The checkout stays editable: the buyer may close it and go on.
      let action: BannerAction | undefined = retry;
      if (key === 'placement-error-payment-unavailable') {
        action = {
          label: t('banner-choose'),
          onClick: () => handlers.focusSection(SectionId.Payment),
        };
      } else if (key === 'placement-error-not-found') {
        action = undefined;
      } else if (key === 'placement-error-loyalty') {
        action = { label: t('loyalty-banner-refresh'), onClick: handlers.refreshLoyalty };
      }
      items.push({
        id,
        priority: BannerPriority.Rejected,
        tone: 'warning',
        title: t(key),
        action,
        onDismiss: handlers.closePlacement,
      });
    }
  }

  const readiness = input.readiness;
  if (readiness && !readiness.expired) {
    // Blocking problems.
    if (input.undeliverableCount > 0) {
      items.push({
        id: 'undeliverable',
        priority: BannerPriority.Blocking,
        tone: 'action',
        title: t('banner-undeliverable', { count: input.undeliverableCount }),
        action: {
          label: t('undeliverable-change-address'),
          onClick: () => handlers.focusSection(SectionId.Address),
        },
      });
    }
    // Loyalty says what is wrong at once, whether the buyer pressed the button or not: the
    // buyer caused it, and without the banner would only see the discount go.
    collectLoyaltyBanners(
      [...readiness.blocking, ...readiness.notices]
        .filter(isLoyaltyIssue)
        .map((issue) => classifyLoyaltyIssue(issue, input.loyalty.redemption)),
      input.loyalty,
      handlers,
      t,
      items,
      dismissible,
      goTo
    );
    if (input.attempted) {
      const allBlocking = visibleBlockingIssues(
        readiness.blocking,
        input.undeliverableCount
      );
      // Loyalty issues have their own banners above.
      const blocking = allBlocking.filter((issue) => !isLoyaltyIssue(issue));
      const sections = SECTION_ORDER.filter(
        (section) =>
          input.missingSections.includes(section) ||
          blocking.some((issue) => issueSection(issue) === section)
      );
      if (sections.length === 1) {
        const [section] = sections;
        // A known issue of the section says better what to do than its name.
        const known = blocking.find(
          (issue) =>
            issueSection(issue) === section && !issueMessage(issue).section
        );
        items.push({
          id: `sections:${section}`,
          priority: BannerPriority.Blocking,
          tone: 'action',
          title: known
            ? issueText(t, known)
            : t('banner-fill-section', { section: t(section) }),
          action: goTo(section),
        });
      } else if (sections.length > 1) {
        items.push({
          id: `sections:${sections.join(',')}`,
          priority: BannerPriority.Blocking,
          tone: 'action',
          title: t('banner-fill-sections', {
            sections: sections.map((section) => t(section)).join(', '),
          }),
          action: goTo(sections[0]),
        });
      }
      blocking
        .filter((issue) => issueSection(issue) === null)
        .forEach((issue, index) => {
          items.push({
            id: `blocking:${issue.code}:${issue.lineId ?? index}`,
            priority: BannerPriority.Blocking,
            tone: issue.severity === 'ERROR' ? 'critical' : 'action',
            title: issueText(t, issue),
            action: issue.lineId ? review : undefined,
          });
        });
      const placing = phase.name === 'idle' || phase.name === 'placing';
      if (
        placing &&
        !readiness.canPlace &&
        allBlocking.length === 0 &&
        input.missingSections.length === 0 &&
        input.undeliverableCount === 0
      ) {
        items.push({
          id: 'not-ready',
          priority: BannerPriority.Blocking,
          tone: 'action',
          title: t('checkout-not-ready'),
        });
      }
    }
  }

  // Failed saves.
  for (const error of input.saveErrors) {
    items.push({
      id: `save:${error.key}`,
      priority: BannerPriority.SaveError,
      // A closable failure left nothing unsaved on screen, so it does not block the order.
      tone: error.closable ? 'warning' : 'critical',
      title: error.message,
      description: t('banner-save-failed-description'),
      action: error.sectionId ? goTo(error.sectionId) : undefined,
      onDismiss: error.closable
        ? () => handlers.closeSaveError(error.key)
        : undefined,
    });
  }

  // Changes of the order.
  const notifications = input.notifications.filter((item) => !item.isDismissed);
  const stock = notifications.filter((item) => STOCK_CODES.has(item.code));
  if (stock.length > 0) {
    dismissible({
      id: `stock:${stock.map((item) => item.id).join(',')}`,
      priority: BannerPriority.Change,
      tone: 'warning',
      title: t('banner-stock-changed', { count: stock.length }),
      description: t('banner-stock-changed-description'),
      action: review,
    });
  }
  const prices = notifications.filter((item) => item.code === 'PRICE_CHANGED');
  if (prices.length > 0) {
    dismissible({
      id: `prices:${prices.map((item) => item.id).join(',')}`,
      priority: BannerPriority.Change,
      tone: 'warning',
      title: t('banner-price-changed'),
      description: t('banner-price-changed-description'),
      action: review,
    });
  }
  if (readiness && !readiness.expired) {
    const seen = new Set<string>();
    readiness.notices
      // Promo code warnings are shown under the code itself; loyalty ones have their banners.
      .filter((issue) => {
        const section = issueSection(issue);
        return section !== SectionId.Promo && section !== SectionId.Loyalty;
      })
      .forEach((issue) => {
        // By what the issue is about, not its place in the list: a closed warning stays closed
        // when another one goes.
        const id = `notice:${issue.code}:${issue.lineId ?? issue.field.join('.')}`;
        if (seen.has(id)) return;
        seen.add(id);
        dismissible({
          id,
          priority: BannerPriority.Change,
          tone: 'warning',
          title: issueText(t, issue),
          action: issue.lineId ? review : undefined,
        });
      });
  }

  // Stable: the order above decides between banners of one priority.
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.priority - b.item.priority || a.index - b.index)
    .map(({ item }) => item);
}

/** Banners of the loyalty selection, one per kind of issue. */
function collectLoyaltyBanners(
  issues: LoyaltyIssue[],
  loyalty: LoyaltyBannerInput,
  handlers: BannerHandlers,
  t: Translate,
  items: BannerItem[],
  dismissible: (item: Omit<BannerItem, 'onDismiss'>) => void,
  goTo: (section: SectionId) => BannerAction
): void {
  const seen = new Set<string>();
  const withoutRedemption = (source: Checkout.LoyaltySource): BannerAction => ({
    label: t(
      source === 'STORE_CREDIT'
        ? 'loyalty-banner-without-store-credit'
        : 'loyalty-banner-without-points'
    ),
    onClick: handlers.dropRedemption,
    loading: loyalty.busy,
  });
  const withoutReward: BannerAction = {
    label: t('loyalty-banner-without-reward'),
    onClick: handlers.dropReward,
    loading: loyalty.busy,
  };
  for (const { kind, issue, blocking } of issues) {
    const id = `loyalty:${kind}:${issue.code}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const source =
      loyalty.redemption?.source ?? issueSource(issue, loyalty.intent);
    switch (kind) {
      case 'reduced':
        dismissible({
          id,
          priority: BannerPriority.Change,
          tone: 'warning',
          title: loyalty.reducedTo
            ? t('loyalty-banner-reduced', { amount: loyalty.reducedTo })
            : t('loyalty-banner-reduced-generic'),
          action: goTo(SectionId.Loyalty),
        });
        break;
      case 'dropped':
        dismissible({
          id,
          priority: BannerPriority.Change,
          tone: 'warning',
          title: t('loyalty-banner-order-too-small'),
        });
        break;
      case 'retry':
        dismissible({
          id,
          priority: BannerPriority.Change,
          tone: 'warning',
          title: t('loyalty-banner-unavailable'),
          action: {
            label: t('banner-retry'),
            onClick: handlers.refreshLoyalty,
            loading: loyalty.busy,
          },
        });
        break;
      case 'signIn':
        items.push({
          id,
          priority: BannerPriority.Blocking,
          tone: 'action',
          title: t('loyalty-banner-sign-in'),
          action: { label: t('loyalty-sign-in'), onClick: handlers.signIn },
        });
        break;
      case 'reward':
      case 'rewardInactive': {
        const item = {
          id,
          priority: blocking ? BannerPriority.Blocking : BannerPriority.Change,
          tone: blocking ? ('action' as const) : ('warning' as const),
          title: t(
            kind === 'rewardInactive'
              ? 'loyalty-banner-reward-inactive'
              : 'loyalty-banner-reward-unavailable'
          ),
          action: withoutReward,
        };
        if (blocking) items.push(item);
        else dismissible(item);
        break;
      }
      case 'redemption': {
        const item = {
          id,
          priority: blocking ? BannerPriority.Blocking : BannerPriority.Change,
          tone: blocking ? ('action' as const) : ('warning' as const),
          title: t(redemptionIssueMessageKey(issue, source)),
          action: withoutRedemption(source),
        };
        if (blocking) items.push(item);
        else dismissible(item);
        break;
      }
    }
  }
}
