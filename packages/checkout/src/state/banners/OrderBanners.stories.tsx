import type { Meta, StoryObj } from '@storybook/react-vite';
import { useTranslations } from 'next-intl';
import { fn } from 'storybook/test';
import { SectionId } from '#checkout/state/interface';
import { maximumPointsRedemption } from '#checkout/stories/loyaltyFixtures';
import { withCheckout } from '#checkout/stories/withCheckout';
import type { Checkout } from '#checkout/types/entity';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { collectBanners } from './banners';
import type { BannerHandlers, BannerInput } from './banners';

/** A failed save, its text by message key: the API hook translates it the same way. */
interface StorySaveError {
  messageKey: string;
  sectionId: SectionId | null;
  closable?: boolean;
}

interface OrderBannersProps {
  /** What differs from a checkout with nothing to say. */
  input: Partial<BannerInput>;
  saveErrors?: StorySaveError[];
  /** One line, as the banner slot shows the first banner when folded. */
  compact?: boolean;
}

const calm: BannerInput = {
  renewal: 'idle',
  placement: { name: 'idle' },
  attempted: false,
  readiness: { canPlace: true, expired: false, blocking: [], notices: [] },
  missingSections: [],
  undeliverableCount: 0,
  saveErrors: [],
  notifications: [],
  dismissed: new Set(),
  loyalty: {
    redemption: null,
    selectedSource: null,
    reducedTo: null,
    busy: false,
  },
};

const handlers: BannerHandlers = {
  retryRenewal: fn(),
  closeRenewal: fn(),
  retryPlacement: fn(),
  closePlacement: fn(),
  closeSaveError: fn(),
  goHome: fn(),
  homePath: '/',
  openCart: fn(),
  focusSection: fn(),
  focusSummary: fn(),
  dismiss: fn(),
  dropRedemption: fn(),
  dropReward: fn(),
  refreshLoyalty: fn(),
  signIn: fn(),
};

/**
 * The banners of the order level (above the submit button), as `collectBanners` makes them from
 * the state of the checkout, most important first, each with its description shown.
 */
function OrderBanners({
  input,
  saveErrors = [],
  compact = false,
}: OrderBannersProps) {
  const t = useTranslations('Checkout');
  const banners = collectBanners(
    {
      ...calm,
      ...input,
      saveErrors: saveErrors.map((error) => ({
        key: error.messageKey,
        message: t(error.messageKey),
        sectionId: error.sectionId,
        closable: error.closable,
      })),
    },
    handlers,
    t
  );
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 560,
      }}
    >
      {banners.map((banner) => (
        <CheckoutBanner
          key={banner.id}
          tone={banner.tone}
          title={banner.title}
          description={compact ? undefined : banner.description}
          action={banner.action}
          onDismiss={banner.onDismiss}
          dismissLabel={t('banner-close')}
          compact={compact}
        />
      ))}
    </div>
  );
}

const issue = (
  code: string,
  field: string[] = [],
  overrides: Partial<Checkout.Issue> = {}
): Checkout.Issue => ({
  code,
  message: '',
  severity: 'WARNING',
  effect: 'STOP',
  field,
  lineId: null,
  retryable: false,
  ...overrides,
});

/** The buyer pressed "place order" and these issues block it. */
const blocked = (...blocking: Checkout.Issue[]): Partial<BannerInput> => ({
  attempted: true,
  readiness: { canPlace: false, expired: false, blocking, notices: [] },
});

/** Warnings of the calculation that do not block the order. */
const noticed = (...notices: Checkout.Issue[]): Partial<BannerInput> => ({
  readiness: { canPlace: true, expired: false, blocking: [], notices },
});

/** The last placement was rejected with this code. */
const rejected = (code: string): Partial<BannerInput> => ({
  placement: { name: 'rejected', code },
});

const loyaltyIssue = (
  code: string,
  overrides: Partial<Checkout.Issue> = {},
  field = ['loyaltyRedemption']
) => issue(code, field, { effect: 'CONTINUE', ...overrides });

/** A loyalty issue, as the checkout reads it without pressing the button. */
const loyalty = (
  item: Checkout.Issue,
  state: Partial<BannerInput['loyalty']> = {}
): Partial<BannerInput> => ({
  ...(item.effect === 'STOP' ? blockedReadiness(item) : noticed(item)),
  loyalty: { ...calm.loyalty, selectedSource: 'POINTS', ...state },
});

const blockedReadiness = (item: Checkout.Issue): Partial<BannerInput> => ({
  readiness: { canPlace: false, expired: false, blocking: [item], notices: [] },
});

const notification = (
  id: string,
  code: Checkout.NotificationCode
): Checkout.Notification => ({
  id,
  code,
  isDismissed: false,
  severity: 'WARNING',
});

const meta = {
  title: 'Checkout/Banners/Order',
  component: OrderBanners,
  decorators: [withCheckout],
  args: { input: {}, compact: false },
  argTypes: { input: { control: false }, saveErrors: { control: false } },
} satisfies Meta<typeof OrderBanners>;

export default meta;
type Story = StoryObj<typeof meta>;

// The checkout is closed or being replaced.

export const RenewalFailed: Story = { args: { input: { renewal: 'failed' } } };

export const Renewing: Story = { args: { input: { renewal: 'renewing' } } };

export const Renewed: Story = { args: { input: { renewal: 'renewed' } } };

export const AlreadyPlaced: Story = {
  args: { input: rejected('CHECKOUT_ALREADY_PLACED') },
};

export const CheckoutExpired: Story = {
  args: { input: rejected('CHECKOUT_EXPIRED') },
};

export const CheckoutAbandoned: Story = {
  args: { input: rejected('CHECKOUT_ABANDONED') },
};

// Payment.

export const PaymentFailed: Story = {
  args: { input: { placement: { name: 'payment-failed', failure: null } } },
};

export const PaymentIncomplete: Story = {
  args: {
    input: {
      placement: { name: 'payment-incomplete', url: 'https://example.com/pay' },
    },
  },
};

// The placement was rejected; the checkout stays editable.

export const RejectedNetwork: Story = {
  args: { input: rejected('NETWORK_ERROR') },
};

export const RejectedUnconfirmed: Story = {
  args: { input: rejected('PLACEMENT_UNCONFIRMED') },
};

export const RejectedInputUnsaved: Story = {
  args: { input: rejected('CHECKOUT_INPUT_UNSAVED') },
};

export const RejectedOrderChanged: Story = {
  args: { input: rejected('CHECKOUT_TOTAL_CHANGED') },
};

export const RejectedPaymentUnavailable: Story = {
  args: { input: rejected('CLIENT_SDK_UNAVAILABLE') },
};

export const RejectedPricesUpdated: Story = {
  args: { input: rejected('CHECKOUT_CLAIM_REQUIRED') },
};

export const RejectedGuestNotAllowed: Story = {
  args: { input: rejected('CHECKOUT_GUEST_NOT_ALLOWED') },
};

export const RejectedLoyaltySignIn: Story = {
  args: { input: rejected('LOYALTY_CUSTOMER_REQUIRED') },
};

export const RejectedLoyalty: Story = {
  args: { input: rejected('LOYALTY_BALANCE_CHANGED') },
};

export const RejectedNotFound: Story = {
  args: { input: rejected('CHECKOUT_PLACEMENT_NOT_FOUND') },
};

export const RejectedGeneric: Story = {
  args: { input: rejected('INTERNAL_ERROR') },
};

// Something blocks the order (after pressing "place order").

export const Undeliverable: Story = {
  args: { input: { undeliverableCount: 2 } },
};

export const FillSection: Story = {
  args: { input: { ...blocked(), missingSections: [SectionId.Contact] } },
};

export const FillSections: Story = {
  args: {
    input: {
      ...blocked(),
      missingSections: [
        SectionId.Contact,
        SectionId.Recipient,
        SectionId.Payment,
      ],
    },
  },
};

export const DeliveryAddressRequired: Story = {
  args: {
    input: blocked(issue('DELIVERY_ADDRESS_REQUIRED', ['deliveryAddresses'])),
  },
};

export const DeliveryOptionsUnavailable: Story = {
  args: {
    input: blocked(issue('DELIVERY_OPTIONS_UNAVAILABLE', ['deliveryGroups'])),
  },
};

export const DeliveryOptionRequired: Story = {
  args: {
    input: blocked(issue('DELIVERY_OPTION_REQUIRED', ['deliveryGroups'])),
  },
};

export const DeliveryOptionInvalid: Story = {
  args: {
    input: blocked(issue('DELIVERY_OPTION_INVALID', ['deliveryGroups'])),
  },
};

export const PaymentMethodsUnavailable: Story = {
  args: { input: blocked(issue('PAYMENT_METHODS_UNAVAILABLE', ['payment'])) },
};

export const PaymentMethodRequired: Story = {
  args: { input: blocked(issue('PAYMENT_METHOD_REQUIRED', ['payment'])) },
};

export const PaymentMethodInvalid: Story = {
  args: { input: blocked(issue('PAYMENT_METHOD_INVALID', ['payment'])) },
};

export const DiscountCodeRejected: Story = {
  args: {
    input: blocked(issue('DISCOUNT_CODE_REJECTED_EXPIRED', ['discountCodes'])),
  },
};

/** An app's own code in a section: the banner names the section. */
export const UnknownSectionIssue: Story = {
  args: { input: blocked(issue('APP_CONTACT_BLOCKED', ['customerIdentity'])) },
};

export const CartEmpty: Story = {
  args: { input: blocked(issue('CART_EMPTY', [], { severity: 'ERROR' })) },
};

export const LineUnavailable: Story = {
  args: {
    input: blocked(
      issue('LINE_UNAVAILABLE', [], { lineId: 'line-1', severity: 'ERROR' })
    ),
  },
};

export const LineQuantityExceeded: Story = {
  args: {
    input: blocked(issue('LINE_QUANTITY_EXCEEDED', [], { lineId: 'line-1' })),
  },
};

/** An app's own code of the whole order. */
export const UnknownOrderIssue: Story = {
  args: { input: blocked(issue('APP_ORDER_BLOCKED')) },
};

/** Nothing is missing, yet the API does not let the order go. */
export const NotReady: Story = { args: { input: blocked() } };

// Loyalty: shown at once, without pressing the button.

export const LoyaltyReduced: Story = {
  args: {
    input: loyalty(loyaltyIssue('LOYALTY_REDEMPTION_REDUCED'), {
      redemption: maximumPointsRedemption,
      reducedTo: '1,240 points',
    }),
  },
};

export const LoyaltyReducedGeneric: Story = {
  args: {
    input: loyalty(loyaltyIssue('LOYALTY_REDEMPTION_REDUCED'), {
      redemption: maximumPointsRedemption,
    }),
  },
};

export const LoyaltyOrderTooSmall: Story = {
  args: { input: loyalty(loyaltyIssue('LOYALTY_REDEMPTION_REDUCED')) },
};

export const LoyaltyUnavailableRetry: Story = {
  args: {
    input: loyalty(
      loyaltyIssue('LOYALTY_SERVICE_UNAVAILABLE', { retryable: true })
    ),
  },
};

export const LoyaltyRetrying: Story = {
  args: {
    input: loyalty(
      loyaltyIssue('LOYALTY_SERVICE_UNAVAILABLE', { retryable: true }),
      {
        busy: true,
      }
    ),
  },
};

export const LoyaltySignIn: Story = {
  args: {
    input: loyalty(loyaltyIssue('CUSTOMER_REQUIRED', { effect: 'STOP' })),
  },
};

export const LoyaltyRewardUnavailable: Story = {
  args: {
    input: loyalty(
      loyaltyIssue('REWARD_NOT_AVAILABLE', { effect: 'STOP' }, [
        'loyaltyReward',
      ])
    ),
  },
};

export const LoyaltyRewardUnavailableWarning: Story = {
  args: {
    input: loyalty(loyaltyIssue('REWARD_NOT_AVAILABLE', {}, ['loyaltyReward'])),
  },
};

export const LoyaltyRewardInactive: Story = {
  args: {
    input: loyalty(
      loyaltyIssue('REWARD_DISCOUNT_NOT_APPLIED', {}, ['loyaltyReward'])
    ),
  },
};

export const LoyaltyPointsInsufficient: Story = {
  args: {
    input: loyalty(
      loyaltyIssue('REQUEST_EXCEEDS_AVAILABLE_POINTS', { effect: 'STOP' })
    ),
  },
};

export const LoyaltyPointsBelowMinimum: Story = {
  args: { input: loyalty(loyaltyIssue('BELOW_MINIMUM_REDEMPTION')) },
};

export const LoyaltyPointsUnavailable: Story = {
  args: { input: loyalty(loyaltyIssue('LOYALTY_REDEMPTION_UNAVAILABLE')) },
};

export const LoyaltyPointsNotApplicable: Story = {
  args: { input: loyalty(loyaltyIssue('REDEMPTION_NOT_APPLICABLE')) },
};

export const LoyaltyStoreCreditFailed: Story = {
  args: {
    input: loyalty(
      loyaltyIssue('INSUFFICIENT_BALANCE', { effect: 'STOP' }, [
        'loyaltyRedemption',
        'amount',
      ]),
      { selectedSource: 'STORE_CREDIT' }
    ),
  },
};

export const LoyaltyDroppingRedemption: Story = {
  args: {
    input: loyalty(
      loyaltyIssue('REQUEST_EXCEEDS_AVAILABLE_POINTS', { effect: 'STOP' }),
      { busy: true }
    ),
  },
};

// A save of the buyer's input failed.

export const SaveContactFailed: Story = {
  args: {
    saveErrors: [
      { messageKey: 'error-update-contact', sectionId: SectionId.Contact },
    ],
  },
};

export const SaveRecipientFailed: Story = {
  args: {
    saveErrors: [
      { messageKey: 'error-save-recipient', sectionId: SectionId.Recipient },
    ],
  },
};

export const SaveNoteFailed: Story = {
  args: {
    saveErrors: [
      { messageKey: 'error-update-note', sectionId: SectionId.Comment },
    ],
  },
};

export const SelectPaymentFailed: Story = {
  args: {
    saveErrors: [
      {
        messageKey: 'error-select-payment',
        sectionId: SectionId.Payment,
        closable: true,
      },
    ],
  },
};

export const RemoveAddressFailed: Story = {
  args: {
    saveErrors: [
      {
        messageKey: 'error-remove-address',
        sectionId: SectionId.Address,
        closable: true,
      },
    ],
  },
};

export const RemoveRecipientFailed: Story = {
  args: {
    saveErrors: [
      {
        messageKey: 'error-remove-recipient',
        sectionId: SectionId.Recipient,
        closable: true,
      },
    ],
  },
};

export const SaveLoyaltyFailed: Story = {
  args: {
    saveErrors: [
      {
        messageKey: 'loyalty-error-save',
        sectionId: SectionId.Loyalty,
        closable: true,
      },
    ],
  },
};

// The order changed on its own.

export const StockChanged: Story = {
  args: {
    input: {
      notifications: [
        notification('n-1', 'OUT_OF_STOCK'),
        notification('n-2', 'NOT_ENOUGH_STOCK'),
      ],
    },
  },
};

export const PriceChanged: Story = {
  args: { input: { notifications: [notification('n-1', 'PRICE_CHANGED')] } },
};

export const LineNotice: Story = {
  args: {
    input: noticed(
      issue('LINE_QUANTITY_EXCEEDED', [], {
        lineId: 'line-1',
        effect: 'CONTINUE',
      })
    ),
  },
};

export const SectionNotice: Story = {
  args: {
    input: noticed(
      issue('APP_CONTACT_CHECK', ['customerIdentity'], { effect: 'CONTINUE' })
    ),
  },
};

export const OrderNotice: Story = {
  args: {
    input: noticed(issue('APP_ORDER_CHECK', [], { effect: 'CONTINUE' })),
  },
};

// Several at once.

/** Every level at once, in the order the banner slot shows them. */
export const Priorities: Story = {
  args: {
    input: {
      ...rejected('NETWORK_ERROR'),
      attempted: true,
      readiness: {
        canPlace: false,
        expired: false,
        blocking: [],
        notices: [],
      },
      missingSections: [SectionId.Payment],
      undeliverableCount: 1,
      notifications: [notification('n-1', 'PRICE_CHANGED')],
    },
    saveErrors: [
      { messageKey: 'error-update-contact', sectionId: SectionId.Contact },
    ],
  },
};

/** The first banner folded to one line, as the slot shows it. */
export const Compact: Story = {
  args: { ...Priorities.args, compact: true },
};
