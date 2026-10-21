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
 * The LiqPay method on the checkout page, without a loyalty program: card, Apple Pay and
 * Google Pay on the LiqPay page after the order is placed, with no form of its own. Its texts
 * come from the module (switch the locale in the toolbar) unless the API gives its own.
 */
const meta = {
  title: 'Checkout/LiqPay',
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

/** Delivery to a Nova Poshta branch, done, with LiqPay offered as the scenario says. */
const scenario = (
  paymentScenario: FormScenario['payment'],
  rest: Omit<FormScenario, 'payment'> = {}
) =>
  formScenario({
    groups: [{ selected: 'nova-poshta-warehouse', input: branchInput }],
    payment: paymentScenario,
    ...rest,
  });

/** LiqPay offered, not chosen. */
export const Offered: Story = { parameters: scenario({ methods: [LIQPAY] }) };

/** LiqPay chosen: the order is paid on the LiqPay page after it is placed. */
export const Selected: Story = {
  parameters: scenario({ methods: [LIQPAY], selected: LIQPAY.handle }),
};

/** LiqPay next to cash on delivery, chosen. */
export const WithCashOnDelivery: Story = {
  parameters: scenario({ selected: LIQPAY.handle }),
};

/** The title and description the API gives are shown instead of the module texts. */
export const TitleFromApi: Story = {
  parameters: scenario({
    methods: [{ ...LIQPAY, title: 'Visa / Mastercard' }],
    selected: LIQPAY.handle,
  }),
};

/** In Ukrainian: the module brings its own texts. */
export const Ukrainian: Story = {
  parameters: scenario({ selected: LIQPAY.handle }),
  globals: { locale: 'uk' },
};

/** Choosing LiqPay: the switch moves at once while the choice is saved. */
export const Choose: Story = {
  parameters: scenario({ selected: NOVA_POSHTA_COD.handle }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Card payment online')
    );
  },
};

/** Choosing LiqPay fails: the switch goes back to cash on delivery. */
export const ChooseFailed: Story = {
  parameters: scenario(
    { selected: NOVA_POSHTA_COD.handle },
    { failures: { selectPaymentMethod: new Error('Network error') } }
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Card payment online')
    );
  },
};

/** The API reset LiqPay: the section asks to choose a method again. */
export const SelectionReset: Story = {
  parameters: scenario({
    reset: {
      handle: LIQPAY.handle,
      reason: {
        code: 'PAYMENT_METHOD_INVALID',
        message: 'LiqPay is not available.',
      },
    },
  }),
};
