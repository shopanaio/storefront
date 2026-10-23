import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { clearCustomerInputs } from '#checkout/sections/delivery/customerInputStorage';
import { CheckoutFormPage } from '#checkout/stories/CheckoutFormPage';
import { branchInput } from '#checkout/stories/deliveryFixtures';
import { formScenario } from '#checkout/stories/formScenario';
import type { FormScenario } from '#checkout/stories/formScenario';
import { mockCheckout } from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { LIQPAY, NOVA_POSHTA_COD } from '#checkout/stories/paymentFixtures';
import { withCheckout } from '#checkout/stories/withCheckout';
import { withDirectory } from '#checkout/stories/withDirectory';

/**
 * The payment section on the checkout page, without a loyalty program: the methods in API
 * order, each through the module of its provider (LiqPay online, Nova Poshta cash on
 * delivery). The methods work with the mock API: pick another one.
 */
const meta = {
  title: 'Checkout/Payment',
  component: CheckoutFormPage,
  decorators: [withCheckout, withDirectory],
  parameters: { layout: 'fullscreen' },
  beforeEach: ({ parameters }) => {
    clearCustomerInputs();
    mockCheckout(parameters.checkout as Partial<CheckoutMockState>);
  },
} satisfies Meta<typeof CheckoutFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Delivery to a Nova Poshta branch, done, with the payment of the scenario. */
const scenario = (
  paymentScenario: FormScenario['payment'],
  rest: Omit<FormScenario, 'payment'> = {}
) =>
  formScenario({
    groups: [{ selected: 'nova-poshta-warehouse', input: branchInput }],
    payment: paymentScenario,
    ...rest,
  });

// Success

/** Nothing is chosen yet: LiqPay and cash on delivery are offered. */
export const NotSelected: Story = { parameters: scenario({}) };

/** Card payment online with LiqPay. */
export const LiqPaySelected: Story = {
  parameters: scenario({ selected: LIQPAY.handle }),
};

/** Cash on delivery of Nova Poshta. */
export const CashOnDelivery: Story = {
  parameters: scenario({ selected: NOVA_POSHTA_COD.handle }),
};

/** The API offers one method only. */
export const SingleMethod: Story = {
  parameters: scenario({ methods: [LIQPAY], selected: LIQPAY.handle }),
};

/** Titles and descriptions given by the API are shown as they are. */
export const TitlesFromApi: Story = {
  parameters: scenario({
    methods: [
      { ...LIQPAY, title: 'Pay by card' },
      { ...NOVA_POSHTA_COD, title: 'Pay at the branch' },
    ],
    selected: LIQPAY.handle,
  }),
};

/** Switching the method: the switch moves at once, while the choice is being saved. */
export const SwitchMethod: Story = {
  parameters: scenario({ selected: LIQPAY.handle }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Cash on delivery')
    );
  },
};

// Warnings

/** The API reset the chosen method: the section asks to choose again. */
export const SelectionReset: Story = {
  parameters: scenario({
    methods: [LIQPAY],
    reset: {
      handle: NOVA_POSHTA_COD.handle,
      reason: {
        code: 'PAYMENT_METHOD_UNAVAILABLE',
        message: 'Cash on delivery is not available for this delivery.',
      },
    },
  }),
};

/**
 * A method whose provider has no module in the storefront is hidden; only LiqPay shows.
 * The console reports the missing module.
 */
export const MethodWithoutModule: Story = {
  parameters: scenario({
    methods: [
      LIQPAY,
      {
        handle: 'stripe-card',
        code: 'card',
        title: 'Stripe',
        flow: 'ONLINE',
        provider: { code: 'stripe' },
      },
    ],
  }),
};

/** No payment method is available for the order. */
export const NoMethods: Story = { parameters: scenario({ methods: [] }) };

// Errors

/** Saving the method fails: the switch goes back to the saved method. */
export const SelectFailed: Story = {
  parameters: scenario(
    { selected: LIQPAY.handle },
    { failures: { selectPaymentMethod: new Error('Network error') } }
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Cash on delivery')
    );
  },
};
