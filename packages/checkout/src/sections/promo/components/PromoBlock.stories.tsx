import type { Meta, StoryObj } from '@storybook/react-vite';
import { makeCheckout } from '#checkout/stories/fixtures';
import {
  allRewardsAccount,
  earning,
  pointsAccount,
} from '#checkout/stories/loyaltyFixtures';
import { CheckoutPageShell } from '#checkout/stories/CheckoutPageShell';
import {
  mockCheckout,
  recalculate,
  useMockCheckout,
  withReward,
} from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { promoCode } from '#checkout/stories/promoFixtures';
import { withCheckout } from '#checkout/stories/withCheckout';
import type { Checkout } from '#checkout/types/entity';

/**
 * Promo codes in the order summary, as on the checkout page. The field works with the mock
 * API: WELCOME10 takes 10% off, FREESHIP waits for a delivery that allows it, SUMMER25 is
 * entered but not applied, and any other code is refused as invalid.
 */
function PromoBlock() {
  const checkout = useMockCheckout();
  if (!checkout) return null;
  return <CheckoutPageShell checkout={checkout} />;
}

const meta = {
  title: 'Checkout/Promo',
  component: PromoBlock,
  decorators: [withCheckout],
  parameters: { layout: 'fullscreen' },
  beforeEach: ({ parameters }) => {
    mockCheckout(parameters.checkout as Partial<CheckoutMockState>);
  },
} satisfies Meta<typeof PromoBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default checkout of a member with the scenario's promo codes, totals included. */
const scenario = (
  codes: string[],
  account: Checkout.LoyaltyAccount | null = pointsAccount,
  checkout: Checkout.Checkout = makeCheckout({ loyaltyEarning: earning })
): { checkout: Partial<CheckoutMockState> } => ({
  checkout: {
    checkout: recalculate({ ...checkout, promoCodes: codes.map(promoCode) }),
    loyalty: { account, loading: false, failed: false },
  },
});

/** No code yet: the field only. */
export const Empty: Story = { parameters: scenario([]) };

/** An applied code: listed, and its discount in the totals. */
export const Applied: Story = { parameters: scenario(['WELCOME10']) };

/** A code waiting for its condition, a delivery that allows it. */
export const Pending: Story = { parameters: scenario(['FREESHIP']) };

/** A code the pricing does not apply, with the reason from the API. */
export const Rejected: Story = { parameters: scenario(['SUMMER25']) };

/** Several codes in their states, in the order they were entered. */
export const SeveralCodes: Story = {
  parameters: scenario(['WELCOME10', 'FREESHIP', 'SUMMER25']),
};

/** The code of a loyalty voucher, entered with the reward and marked as one. */
export const LoyaltyVoucherCode: Story = {
  parameters: {
    checkout: {
      checkout: withReward(
        makeCheckout({ loyaltyEarning: earning }),
        'reward-voucher'
      ),
      loyalty: { account: allRewardsAccount, loading: false, failed: false },
    },
  },
};

/** A guest: promo codes work without an account, the loyalty block is not shown. */
export const Guest: Story = {
  parameters: scenario(
    ['WELCOME10'],
    null,
    makeCheckout({
      customerIdentity: { ...makeCheckout().customerIdentity, customer: null },
    })
  ),
};
