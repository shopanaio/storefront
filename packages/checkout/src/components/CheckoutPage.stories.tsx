import type { Meta, StoryObj } from '@storybook/react-vite';
import { clearCustomerInputs } from '#checkout/sections/delivery/customerInputStorage';
import {
  branchInput,
  courierInput,
  kyivAddress,
  lockerInput,
} from '#checkout/stories/deliveryFixtures';
import type { GroupScenario } from '#checkout/stories/deliveryFixtures';
import { guestCheckout } from '#checkout/stories/fixtures';
import { formScenario } from '#checkout/stories/formScenario';
import type { FormScenario } from '#checkout/stories/formScenario';
import {
  bothSourcesAccount,
  cashbackEarning,
  earning,
  guestEarning,
  maximumPointsRedemption,
  pointsAccount,
  storeCreditAccount,
  storeCreditRedemption,
} from '#checkout/stories/loyaltyFixtures';
import {
  mockCheckout,
  withPromoCode,
  withRedemption,
  withReward,
} from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { LIQPAY, NOVA_POSHTA_COD } from '#checkout/stories/paymentFixtures';
import { withCheckout } from '#checkout/stories/withCheckout';
import { withDirectory } from '#checkout/stories/withDirectory';
import { settlementAddressData } from '#checkout/vendors/nova-poshta/address';
import { popularCities } from '#checkout/vendors/nova-poshta/popularCities';
import type { Checkout } from '#checkout/types/entity';
import { CheckoutFormPage } from '#checkout/stories/CheckoutFormPage';

/**
 * The whole checkout page as the buyer fills it in: the contact with the sign-in button, the
 * city and Nova Poshta delivery, a different recipient, LiqPay, the order comment, and in the
 * summary the promo codes, the loyalty block and the totals. Every section is the real one
 * against the mock API, so the page can be clicked through; placing the order is refused.
 */
const meta = {
  title: 'Checkout/Page/Filled',
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

/** Taras receives the order instead of the buyer. */
const RECIPIENT: Checkout.Recipient = {
  email: null,
  firstName: 'Taras',
  lastName: 'Melnyk',
  middleName: 'Ivanovych',
  phone: '+380501112233',
};

const NOTE = 'Please call 10 minutes before. The intercom does not work.';

interface PageScenario {
  delivery?: GroupScenario;
  payment?: FormScenario['payment'];
  recipient?: Checkout.Recipient | null;
  note?: string | null;
  promoCodes?: string[];
  loyalty?: {
    account: Checkout.LoyaltyAccount | null;
    redemption?: Checkout.LoyaltyRedemption | null;
    rewardId?: string | null;
    earning?: Checkout.LoyaltyEarning | null;
  };
  checkout?: Partial<Checkout.Checkout>;
}

/**
 * Story parameters of the page: the default checkout with the delivery, payment, recipient,
 * note, promo codes and loyalty of the scenario, totals recalculated by the mock API.
 */
function pageScenario({
  delivery = {},
  payment,
  recipient = null,
  note = null,
  promoCodes = [],
  loyalty = { account: null },
  checkout: overrides,
}: PageScenario) {
  const base = formScenario({
    groups: [delivery],
    payment,
    checkout: { customerNote: note, ...overrides },
  });
  let checkout = base.checkout.checkout as Checkout.Checkout;
  checkout = {
    ...checkout,
    deliveryGroups: checkout.deliveryGroups.map((group) => ({
      ...group,
      recipient,
    })),
    loyaltyEarning: loyalty.earning ?? null,
  };
  for (const code of promoCodes) checkout = withPromoCode(checkout, code);
  if (loyalty.rewardId) checkout = withReward(checkout, loyalty.rewardId);
  if (loyalty.redemption) {
    checkout = {
      ...withRedemption(checkout, loyalty.redemption),
      loyaltySelection: {
        source: loyalty.redemption.source,
        points: null,
        amount: null,
        rewardId: loyalty.rewardId ?? null,
      },
    };
  }
  return {
    ...base,
    checkout: {
      ...base.checkout,
      checkout,
      loyalty: { account: loyalty.account, loading: false, failed: false },
    },
  };
}

/**
 * Everything filled in: Kyiv, Nova Poshta branch №5, a different recipient, LiqPay, a comment,
 * the WELCOME10 promo code, the GOLD100 voucher of the loyalty program and the points paying
 * part of the order. Ready to place.
 */
export const Filled: Story = {
  parameters: pageScenario({
    delivery: { selected: 'nova-poshta-warehouse', input: branchInput },
    payment: { selected: LIQPAY.handle },
    recipient: RECIPIENT,
    note: NOTE,
    promoCodes: ['WELCOME10'],
    loyalty: {
      account: bothSourcesAccount,
      rewardId: 'reward-voucher',
      redemption: maximumPointsRedemption,
      earning,
    },
  }),
};

/** The same order in Ukrainian: the checkout and its modules bring their own texts. */
export const FilledUkrainian: Story = {
  ...Filled,
  globals: { locale: 'uk' },
};

/**
 * Courier delivery of Nova Poshta to the door, paid with store credit and LiqPay, earning
 * cashback; the buyer receives the order.
 */
export const Courier: Story = {
  parameters: pageScenario({
    delivery: { selected: 'nova-poshta-doors', input: courierInput },
    payment: { selected: LIQPAY.handle },
    note: 'Leave at the door, apartment 14.',
    promoCodes: ['WELCOME10'],
    loyalty: {
      account: storeCreditAccount,
      redemption: storeCreditRedemption,
      earning: cashbackEarning,
    },
  }),
};

/**
 * A parcel locker, cash on delivery of Nova Poshta, a different recipient and the points
 * left to spend later.
 */
export const LockerCashOnDelivery: Story = {
  parameters: pageScenario({
    delivery: { selected: 'nova-poshta-postomat', input: lockerInput },
    payment: { selected: NOVA_POSHTA_COD.handle },
    recipient: RECIPIENT,
    loyalty: { account: pointsAccount, earning },
  }),
};

/**
 * A guest: no loyalty account, the sign-in offer of the points the order earns, a promo code
 * and a code the order does not meet.
 */
export const Guest: Story = {
  parameters: pageScenario({
    delivery: { selected: 'nova-poshta-warehouse', input: branchInput },
    payment: { selected: LIQPAY.handle },
    recipient: RECIPIENT,
    note: NOTE,
    promoCodes: ['WELCOME10', 'SUMMER25'],
    loyalty: { account: null, earning: guestEarning },
    checkout: { customerIdentity: guestCheckout.customerIdentity },
  }),
};

/**
 * Where the buyer starts: the contact is known, the city is Kyiv, nothing else is chosen.
 * Fill it in to reach the `Filled` page.
 */
export const Empty: Story = {
  parameters: pageScenario({
    loyalty: { account: bothSourcesAccount, earning },
  }),
};

/** Lviv: the city button shows the oblast under the city, as the store lists it. */
export const CityWithOblast: Story = {
  parameters: pageScenario({
    delivery: {
      address: {
        ...kyivAddress,
        city: 'Львів',
        provinceCode: '46',
        data: settlementAddressData(popularCities[5]),
        formatted: ['Львів'],
        formattedArea: 'Львів, Ukraine',
      },
    },
    loyalty: { account: bothSourcesAccount, earning },
  }),
  globals: { locale: 'uk' },
};
