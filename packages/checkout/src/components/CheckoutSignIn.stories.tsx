import type { Meta, StoryObj } from '@storybook/react-vite';
import { clearCustomerInputs } from '#checkout/sections/delivery/customerInputStorage';
import { defaultCheckout, guestCheckout } from '#checkout/stories/fixtures';
import { guestEarning } from '#checkout/stories/loyaltyFixtures';
import { noticeDisclosures } from '#checkout/stories/policyFixtures';
import { mockCheckout } from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { withCheckout } from '#checkout/stories/withCheckout';
import { withDirectory } from '#checkout/stories/withDirectory';
import { CheckoutGatePage } from '#checkout/stories/CheckoutGatePage';

/**
 * Sign-in in the checkout, headless: the real screens of `@shopana/storefront-auth/ui` over a
 * mocked `useAuth()`. The email or SMS code is `000000`; any password signs in (`wrong` is
 * refused). Signed in, the buyer's account fills the contact and claims the cart (G4).
 */
const meta = {
  title: 'Checkout/Page/Sign-in',
  component: CheckoutGatePage,
  decorators: [withCheckout, withDirectory],
  parameters: { layout: 'fullscreen' },
  globals: { locale: 'uk' },
  beforeEach: ({ parameters }) => {
    clearCustomerInputs();
    mockCheckout(parameters.checkout as Partial<CheckoutMockState>);
  },
} satisfies Meta<typeof CheckoutGatePage>;

export default meta;
type Story = StoryObj<typeof meta>;

// The store has its policies set: the consent under the field links to its privacy policy.
const guest = (identity: Partial<typeof guestCheckout.customerIdentity> = {}) => ({
  ...guestCheckout,
  disclosures: noticeDisclosures,
  customerIdentity: { ...guestCheckout.customerIdentity, ...identity },
});

const accountOnly = {
  ...guestCheckout,
  guestCheckoutAllowed: false,
  disclosures: noticeDisclosures,
  // The points the order earns invite the guest to sign in; "Log in" leads to the form.
  loyaltyEarning: guestEarning,
  customerIdentity: {
    ...guestCheckout.customerIdentity,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
  },
};

/** G1: a guest checkout with "Log in" next to the contact; it opens the sign-in drawer. */
export const GuestCheckout: Story = {
  parameters: { checkout: { checkout: guest() } },
};

/** G2: the sign-in drawer, prefilled from the contact; Phone | Email, password, providers. */
export const GuestSignInDrawer: Story = {
  parameters: { checkout: { checkout: guest() } },
  args: { signInOpen: true },
};

/** G2: the store has email codes only. */
export const GuestSignInEmailOnly: Story = {
  parameters: {
    checkout: {
      checkout: guest(),
      session: {
        methods: { phoneOtp: { signIn: false, signUp: false, codeLength: 6 } },
      },
    },
  },
  args: { signInOpen: true },
};

/** Back from Google without a session: the drawer opens to say the sign-in was cancelled. */
export const GuestSocialCancelled: Story = {
  parameters: {
    checkout: { checkout: guest(), session: { authResult: 'cancelled' } },
  },
};

/** The email belongs to an account with another way to sign in. */
export const GuestAccountNotLinked: Story = {
  parameters: {
    checkout: { checkout: guest(), session: { authResult: 'accountNotLinked' } },
  },
};

/**
 * A1: the store takes orders from accounts only; the sign-in stands in place of the contact,
 * the summary keeps the lines, the guest loyalty invite and the totals.
 */
export const AccountOnly: Story = {
  parameters: { checkout: { checkout: accountOnly } },
};

/** S6: the session ended on the account checkout; the same sign-in says so. */
export const AccountOnlySessionExpired: Story = {
  parameters: {
    checkout: { checkout: accountOnly, session: { sessionExpired: true } },
  },
};

/** A3/A4: signed in by email; the email of the contact is read-only. */
export const SignedInByEmail: Story = {
  parameters: { checkout: { checkout: defaultCheckout, session: { loginMethod: 'email' } } },
};

/** A3/A4: signed in by an SMS code; the phone of the contact is read-only. */
export const SignedInByPhone: Story = {
  parameters: {
    checkout: {
      checkout: {
        ...defaultCheckout,
        customerIdentity: {
          ...defaultCheckout.customerIdentity,
          customer: { ...defaultCheckout.customerIdentity.customer!, email: null },
          email: null,
        },
      },
      session: { loginMethod: 'phone', phone: '+380671234567' },
    },
  },
};
