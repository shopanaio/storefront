import type { Meta, StoryObj } from '@storybook/react-vite';
import { fireEvent, userEvent, within } from 'storybook/test';
import { makeCheckout } from '#checkout/stories/fixtures';
import { CheckoutPageShell } from '#checkout/stories/CheckoutPageShell';
import {
  mockCheckout,
  recalculate,
  useMockCheckout,
} from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { promoCode } from '#checkout/stories/promoFixtures';
import { withCheckout } from '#checkout/stories/withCheckout';
import type { Checkout } from '#checkout/types/entity';

/**
 * Promo codes in the order summary, as on the checkout page, without a loyalty program. The
 * field works with the mock API: WELCOME10 takes 10% off, FREESHIP waits for a delivery that
 * allows it, SUMMER25 is entered but not applied, and any other code is refused as invalid.
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

/** The default checkout with the scenario's promo codes, totals included; no loyalty account. */
const scenario = (
  codes: string[],
  checkout: Checkout.Checkout = makeCheckout()
): { checkout: Partial<CheckoutMockState> } => ({
  checkout: {
    checkout: recalculate({ ...checkout, promoCodes: codes.map(promoCode) }),
    loyalty: { account: null, loading: false, failed: false },
  },
});

/** Types a code into the field and presses Apply, as the buyer does. */
async function enterCode(canvasElement: HTMLElement, code: string) {
  const canvas = within(canvasElement);
  const field = await canvas.findByRole('textbox', { name: /coupon code/i });
  // The field is controlled by a store: the value is set as the browser does on input.
  fireEvent.change(field, { target: { value: code } });
  await userEvent.click(await canvas.findByRole('button', { name: /apply/i }));
}

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

/** Entering a code: the button waits for the answer, then the code is listed with its discount. */
export const EnterCode: Story = {
  parameters: scenario([]),
  play: async ({ canvasElement }) => {
    await enterCode(canvasElement, 'WELCOME10');
  },
};

/** A code the API refuses: the field says why and keeps the code. */
export const InvalidCode: Story = {
  parameters: scenario([]),
  play: async ({ canvasElement }) => {
    await enterCode(canvasElement, 'NOPE');
    await within(canvasElement).findByText(/isn't valid/i, undefined, {
      timeout: 3000,
    });
  },
};

/** Removing a code asks first. */
export const RemoveConfirm: Story = {
  parameters: scenario(['WELCOME10']),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: /WELCOME10/i })
    );
  },
};

/** A guest: promo codes work without an account. */
export const Guest: Story = {
  parameters: scenario(
    ['WELCOME10'],
    makeCheckout({
      customerIdentity: { ...makeCheckout().customerIdentity, customer: null },
    })
  ),
};
