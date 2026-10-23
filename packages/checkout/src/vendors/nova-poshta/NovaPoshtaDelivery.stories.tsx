import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { clearCustomerInputs } from '#checkout/sections/delivery/customerInputStorage';
import {
  CheckoutEvent,
  emitCheckoutEvent,
  OperationKey,
} from '#checkout/state/checkoutBus';
import { CheckoutFormPage } from '#checkout/stories/CheckoutFormPage';
import {
  branchInput,
  courierInput,
  KYIV_POINTS,
  lockerInput,
  npOption,
  npOptions,
} from '#checkout/stories/deliveryFixtures';
import { makeLine } from '#checkout/stories/fixtures';
import { formScenario } from '#checkout/stories/formScenario';
import { mockCheckout } from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { withCheckout } from '#checkout/stories/withCheckout';
import { withDirectory } from '#checkout/stories/withDirectory';

/**
 * Delivery with Nova Poshta on the checkout page, without a loyalty program: the city of the
 * address, the branch, parcel locker and courier services with their forms, the shipping
 * quote, and the payment methods that come with it. The services work with the mock API and
 * the mock directory of Kyiv: pick another service, open the list of branches, pick one.
 */
const meta = {
  title: 'Checkout/Nova Poshta',
  component: CheckoutFormPage,
  decorators: [withCheckout, withDirectory],
  parameters: { layout: 'fullscreen' },
  beforeEach: ({ parameters }) => {
    // Input typed in another story stays in the browser otherwise.
    clearCustomerInputs();
    mockCheckout(parameters.checkout as Partial<CheckoutMockState>);
  },
} satisfies Meta<typeof CheckoutFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const WAREHOUSE = 'nova-poshta-warehouse';
const POSTOMAT = 'nova-poshta-postomat';
const DOORS = 'nova-poshta-doors';

/** The branch list in the drawer, which renders outside the story. */
const page = () => within(document.body);

/** Opens the list of branches of the selected branch service. */
async function openBranches(canvasElement: HTMLElement) {
  await userEvent.click(
    await within(canvasElement).findByRole('button', { name: /^Branch/ })
  );
}

/** Picks a branch from the list, as the buyer does. */
async function pickBranch(canvasElement: HTMLElement, label: string) {
  await openBranches(canvasElement);
  await userEvent.click(
    await page().findByText(label, undefined, { timeout: 3000 })
  );
  await userEvent.click(
    await page().findByRole('button', { name: 'Pick up here' })
  );
}

// Success

/** A city is set and no service is chosen yet: the buyer picks one. */
export const ChooseService: Story = { parameters: formScenario() };

/** Branch delivery with a branch picked: the buyer pays the carrier on receipt, about the estimate. */
export const BranchSelected: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE, input: branchInput }],
    payment: { selected: 'nova-poshta-cod' },
  }),
};

/** Parcel locker delivery with a locker picked. */
export const ParcelLockerSelected: Story = {
  parameters: formScenario({
    groups: [{ selected: POSTOMAT, input: lockerInput }],
    payment: { selected: 'liqpay' },
  }),
};

/** Courier delivery with the address filled in. */
export const CourierSelected: Story = {
  parameters: formScenario({
    groups: [{ selected: DOORS, input: courierInput }],
    payment: { selected: 'liqpay' },
  }),
};

/** The store pays Nova Poshta: a fixed price at checkout and no carrier fee on receipt. */
export const StorePaysShipping: Story = {
  parameters: formScenario({
    groups: [
      {
        options: npOptions('MERCHANT'),
        selected: WAREHOUSE,
        input: branchInput,
      },
    ],
    payment: { selected: 'liqpay' },
  }),
};

/** Free shipping from a discount covers the carrier fee: nothing is paid on receipt. */
export const FreeShipping: Story = {
  parameters: formScenario({
    groups: [
      {
        selected: WAREHOUSE,
        input: branchInput,
        freeShipping: {
          source: 'DISCOUNT',
          title: 'Free shipping from 1 000 UAH',
          code: null,
        },
      },
    ],
    payment: { selected: 'liqpay' },
  }),
};

/** The carrier has no estimate yet: the option says the rate is being calculated. */
export const EstimatePending: Story = {
  parameters: formScenario({
    groups: [
      {
        options: [npOption('warehouse', { estimate: null }), npOption('doors')],
        selected: WAREHOUSE,
        input: branchInput,
      },
    ],
  }),
};

/** Two shipments of one order: each picks its own service or one for both. */
export const TwoShipments: Story = {
  parameters: formScenario({
    groups: [
      {
        id: 'group-1',
        lines: [
          makeLine({
            id: 'line-1',
            title: 'Large, 32 cm',
            productTitle: 'Pepperoni pizza',
            quantity: 2,
            unitPrice: 289,
            imageSrc: 'https://picsum.photos/seed/pepperoni/200',
          }),
        ],
        selected: WAREHOUSE,
        input: branchInput,
      },
      {
        id: 'group-2',
        lines: [
          makeLine({
            id: 'line-2',
            title: 'Medium, 28 cm',
            productTitle: 'Four cheese pizza',
            unitPrice: 319,
            imageSrc: 'https://picsum.photos/seed/cheese/200',
          }),
          makeLine({
            id: 'line-3',
            title: '0.5 l',
            productTitle: 'Cola',
            quantity: 2,
            unitPrice: 45,
          }),
        ],
        selected: WAREHOUSE,
        input: branchInput,
      },
    ],
  }),
};

/** Picking a branch from the list: it is saved, then the price and dates appear. */
export const PickBranch: Story = {
  parameters: formScenario({ groups: [{ selected: WAREHOUSE }] }),
  play: async ({ canvasElement }) => {
    await pickBranch(canvasElement, '№12 вул. Богатирська, 11');
    await within(canvasElement).findByText(/Shipping:/, undefined, {
      timeout: 4000,
    });
  },
};

/** Switching to the courier: the form asks for the street and the building. */
export const SwitchToCourier: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE, input: branchInput }],
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Nova Poshta courier')
    );
  },
};

// Warnings

/** No city yet: the services wait for it, and the branch cannot be picked. */
export const NoCity: Story = {
  parameters: formScenario({
    groups: [{ address: null, selected: WAREHOUSE }],
  }),
};

/** Branch service chosen, branch not picked yet: the order waits for it. */
export const BranchNotPicked: Story = {
  parameters: formScenario({ groups: [{ selected: WAREHOUSE }] }),
};

/** The carrier refused the saved branch: the selection is reset and the buyer picks another. */
export const BranchRefused: Story = {
  parameters: formScenario({
    groups: [
      {
        input: { ...branchInput, warehouseRef: KYIV_POINTS[3].ref },
        reset: {
          handle: WAREHOUSE,
          reason: {
            code: 'DELIVERY_CUSTOMER_INPUT_INVALID',
            message: 'The branch does not accept parcels.',
          },
        },
      },
    ],
  }),
};

/** The service is unavailable for now: the selection is reset and another is chosen. */
export const ServiceUnavailable: Story = {
  parameters: formScenario({
    groups: [
      {
        options: [npOption('warehouse'), npOption('postomat')],
        reset: {
          handle: DOORS,
          reason: {
            code: 'DELIVERY_OPTION_TEMPORARILY_UNAVAILABLE',
            message: 'Courier delivery is unavailable.',
          },
        },
      },
    ],
  }),
};

/** Nothing can be delivered to the city: the lines block the order until removed. */
export const Undeliverable: Story = {
  parameters: formScenario({
    groups: [
      {
        id: 'group-1',
        lines: [
          makeLine({
            id: 'line-1',
            title: 'Large, 32 cm',
            productTitle: 'Pepperoni pizza',
            quantity: 2,
            unitPrice: 289,
          }),
        ],
        selected: WAREHOUSE,
        input: branchInput,
      },
      {
        id: 'group-2',
        lines: [
          makeLine({
            id: 'line-3',
            title: '0.5 l',
            productTitle: 'Cola',
            quantity: 2,
            unitPrice: 45,
          }),
        ],
        options: [],
      },
    ],
  }),
};

// Errors

/** Selecting a service fails: the section says so and offers to retry. */
export const SelectFailed: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE, input: branchInput }],
    failures: { selectDeliveryMethod: new Error('Network error') },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Nova Poshta parcel locker'));
    await expect(
      await canvas.findByRole(
        'button',
        { name: 'Try again' },
        { timeout: 3000 }
      )
    ).toBeVisible();
  },
};

/** The API refuses the picked branch for good: the section says why and offers to save again. */
export const BranchRejected: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE }],
    failures: {
      updateShippingMethod: [
        {
          code: 'DELIVERY_CUSTOMER_INPUT_INVALID',
          message: 'The branch does not accept parcels.',
          retryable: false,
        },
      ],
    },
  }),
  play: async ({ canvasElement }) => {
    await pickBranch(canvasElement, '№5 вул. Федорова, 32');
    await within(canvasElement).findByRole(
      'button',
      { name: 'Save' },
      { timeout: 4000 }
    );
  },
};

/** Saving the branch fails on the network: the section retries and says so. */
export const BranchSaveRetrying: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE }],
    failures: { updateShippingMethod: new Error('Network error') },
  }),
  play: async ({ canvasElement }) => {
    await pickBranch(canvasElement, '№5 вул. Федорова, 32');
  },
};

/** The shipments changed while the service was being selected: the buyer chooses again. */
export const ShipmentsChanged: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE, input: branchInput }],
    failures: {
      selectDeliveryMethod: [
        {
          code: 'CHECKOUT_DELIVERY_GROUP_CHANGED',
          message: 'Delivery groups changed',
        },
      ],
    },
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Nova Poshta parcel locker')
    );
  },
};

/** The Nova Poshta directory does not answer: the branch list offers to retry. */
export const DirectoryUnavailable: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE }],
    directory: { failure: 'unavailable' },
  }),
  play: async ({ canvasElement }) => {
    await openBranches(canvasElement);
    await page().findByText(/temporarily unavailable/i, undefined, {
      timeout: 3000,
    });
  },
};

/** The directory fails for another reason. */
export const DirectoryFailed: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE }],
    directory: { failure: 'failed' },
  }),
  play: async ({ canvasElement }) => {
    await openBranches(canvasElement);
  },
};

/** No branch of the city matches. */
export const NoBranchesFound: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE }],
    directory: { points: [] },
  }),
  play: async ({ canvasElement }) => {
    await openBranches(canvasElement);
  },
};

// Loading

/** The branch list is loading. */
export const BranchesLoading: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE }],
    directory: { latency: 'never' },
  }),
  play: async ({ canvasElement }) => {
    await openBranches(canvasElement);
  },
};

/** A new city is being applied: the services wait for it. */
export const CityApplying: Story = {
  parameters: formScenario({
    groups: [{ selected: WAREHOUSE, input: branchInput }],
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Nova Poshta branch');
    // The address save never ends here, so the skeleton stays.
    await emitCheckoutEvent(CheckoutEvent.OperationStart, {
      key: OperationKey.UpdateDeliveryAddresses,
    });
  },
};
