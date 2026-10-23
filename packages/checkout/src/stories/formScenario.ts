import type { Checkout } from '#checkout/types/entity';
import { deliveryGroup, type GroupScenario } from './deliveryFixtures';
import { makeCheckout } from './fixtures';
import { recalculate } from './mockCheckout';
import type { CheckoutMockState, MockFailures } from './mockCheckout';
import { payment } from './paymentFixtures';
import type { DirectoryScenario } from './withDirectory';

/** What a delivery or payment story renders the checkout page with. */
export interface FormScenario {
  /** Delivery groups; one group with every line by default. */
  groups?: GroupScenario[];
  /** Payment methods offered and the selected one; LiqPay and cash on delivery by default. */
  payment?: Parameters<typeof payment>[1];
  failures?: MockFailures;
  directory?: DirectoryScenario;
  /** Other fields of the checkout. */
  checkout?: Partial<Checkout.Checkout>;
}

/**
 * Story parameters of a scenario: the default checkout with its delivery groups and payment,
 * totals included, without a loyalty account.
 */
export function formScenario({
  groups = [{}],
  payment: paymentScenario,
  failures,
  directory,
  checkout: overrides,
}: FormScenario = {}): {
  checkout: Partial<CheckoutMockState>;
  directory: DirectoryScenario;
} {
  const base = makeCheckout(overrides);
  return {
    checkout: {
      checkout: recalculate({
        ...base,
        deliveryGroups: groups.map(deliveryGroup),
        payment: payment(base.cost.totalAmount, paymentScenario),
      }),
      loyalty: { account: null, loading: false, failed: false },
      failures,
    },
    directory: directory ?? {},
  };
}
