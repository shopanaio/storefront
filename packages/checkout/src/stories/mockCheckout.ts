import { useSyncExternalStore } from 'react';
import { fn, mocked } from 'storybook/test';
import type {
  DeliveryMethodUpdateDto,
  PaymentMethodUpdateDto,
} from '#checkout/api/dto';
import type { CheckoutApi } from '#checkout/api/interface';
import type { CheckoutDeliveryAddressInput } from '#checkout/graphql/operations';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutAuth } from '#checkout/hooks/useCheckoutAuth';
import { useLoyaltyAccount } from '#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount';
import { useRemoveCartLines } from '#checkout/hooks/useUndeliverableLines';
import type {
  RedemptionRequest,
  RewardChoice,
} from '#checkout/sections/loyalty/selection';
import type { Checkout } from '#checkout/types/entity';
import {
  withDeliveryAddress,
  withDeliveryInput,
  withDeliveryOption,
} from './deliveryFixtures';
import { defaultCheckout } from './fixtures';
import { moneyRewards, rewardDiscount, rewards } from './loyaltyFixtures';
import { PROMO_CODES, promoCode, promoDiscount } from './promoFixtures';

/**
 * What a story renders the checkout with, in place of the API. The modules read here are
 * mocked in `.storybook/preview.tsx`; `mockCheckout` points them at this state.
 */
export interface CheckoutMockState {
  checkout: Checkout.Checkout | null;
  loyalty: {
    account: Checkout.LoyaltyAccount | null;
    loading: boolean;
    failed: boolean;
  };
  /** Writes the API refuses in the story, with what they are rejected with. */
  failures?: MockFailures;
}

/** Delivery and payment writes a story can make fail. */
export type MockFailures = Partial<
  Record<
    | 'selectDeliveryMethod'
    | 'updateShippingMethod'
    | 'selectPaymentMethod'
    | 'saveDeliveryAddress',
    unknown
  >
>;

/** How long a write of the mock API takes, so its loading state shows. */
const LATENCY_MS = 600;

let state: CheckoutMockState = {
  checkout: defaultCheckout,
  loyalty: { account: null, loading: false, failed: false },
};
const listeners = new Set<() => void>();

function setState(next: CheckoutMockState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function useMockState(): CheckoutMockState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state
  );
}

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

const money = (amount: number, currencyCode: string) => ({
  amount: Math.round(amount * 100) / 100,
  currencyCode,
});

/** Share of the order the program lets the buyer pay with points or store credit. */
const MAX_ORDER_SHARE = 0.5;

/**
 * A redemption as the loyalty service would quote it: the request within the balance, the
 * program limit and half of the order. Points are worth their balance in money.
 */
function quoteRedemption(
  checkout: Checkout.Checkout,
  option: Checkout.LoyaltySourceOption,
  request: RedemptionRequest
): Checkout.LoyaltyRedemption {
  const currency = checkout.currencyCode;
  const orderLimit = checkout.cost.subtotalAmount.amount * MAX_ORDER_SHARE;
  if (request.source === 'POINTS') {
    const available = Number(option.availablePoints ?? 0);
    const rate = available > 0 ? option.availableAmount.amount / available : 0;
    const limits = [
      available,
      Number(option.maximumPerOrder?.points ?? Infinity),
      rate > 0 ? Math.floor(orderLimit / rate) : 0,
    ];
    const points = Math.min(Number(request.points ?? Infinity), ...limits);
    return {
      source: 'POINTS',
      requestedPoints: request.points,
      requestedAmount: null,
      points: String(points),
      availablePoints: option.availablePoints,
      availableAmount: option.availableAmount,
      discount: money(points * rate, currency),
      expiresAt: null,
    };
  }
  const amount = Math.min(
    request.amount === null ? Infinity : Number(request.amount),
    option.availableAmount.amount,
    option.maximumPerOrder?.amount.amount ?? Infinity,
    orderLimit
  );
  return {
    source: 'STORE_CREDIT',
    requestedPoints: null,
    requestedAmount:
      request.amount === null ? null : money(Number(request.amount), currency),
    points: null,
    availablePoints: null,
    availableAmount: option.availableAmount,
    discount: money(amount, currency),
    expiresAt: null,
  };
}

/**
 * The totals of the checkout as the calculation returns them: the goods, minus what the promo
 * codes and the reward take off, plus shipping, minus what is paid with points or store credit.
 */
export function recalculate(checkout: Checkout.Checkout): Checkout.Checkout {
  const { cost, currencyCode } = checkout;
  const discount =
    promoDiscount(checkout) + rewardDiscount(checkout.loyaltyRewardId);
  const shipping = checkout.deliveryGroups.reduce(
    (sum, group) => sum + (group.shipping?.total.amount ?? 0),
    0
  );
  const paid = checkout.loyaltyRedemption?.discount.amount ?? 0;
  const total = money(
    cost.subtotalAmount.amount - discount + shipping - paid,
    currencyCode
  );
  return {
    ...checkout,
    cost: {
      ...cost,
      merchandiseDiscountAmount: money(discount, currencyCode),
      totalDiscountAmount: money(discount, currencyCode),
      totalShippingAmount: money(shipping, currencyCode),
      loyaltyAmount: money(paid, currencyCode),
      totalAmount: total,
    },
    payment: { ...checkout.payment, payableAmount: total },
  };
}

/** The checkout with the redemption applied, as the calculation returns it. */
export function withRedemption(
  checkout: Checkout.Checkout,
  redemption: Checkout.LoyaltyRedemption | null
): Checkout.Checkout {
  return recalculate({
    ...checkout,
    loyaltyRedemption: redemption,
    // The saved choice is applied now: its issues are gone.
    issues: checkout.issues.filter(
      (issue) => issue.field[0] !== 'loyaltyRedemption'
    ),
  });
}

/**
 * The checkout with the reward applied instead of the previous one. A voucher's code is entered
 * with it, and the code of the previous voucher removed.
 */
export function withReward(
  checkout: Checkout.Checkout,
  rewardId: string | null
): Checkout.Checkout {
  const voucher = (id: string | null) =>
    [...rewards, ...moneyRewards].find((reward) => reward.id === id)
      ?.voucherCode ?? null;
  const previous = voucher(checkout.loyaltyRewardId);
  const next = voucher(rewardId);
  const codes = checkout.promoCodes.filter((entry) => entry.code !== previous);
  return recalculate({
    ...checkout,
    loyaltyRewardId: rewardId,
    loyaltySelection: { ...selectionOf(checkout), rewardId },
    promoCodes:
      next && !codes.some((entry) => entry.code === next)
        ? [...codes, promoCode(next)]
        : codes,
    issues: checkout.issues.filter(
      (issue) => issue.field[0] !== 'loyaltyReward'
    ),
  });
}

/** The checkout with the promo code entered, as the pricing treats it. */
export function withPromoCode(
  checkout: Checkout.Checkout,
  code: string
): Checkout.Checkout {
  return recalculate({
    ...checkout,
    promoCodes: [...checkout.promoCodes, promoCode(code)],
  });
}

function selectionOf(checkout: Checkout.Checkout): Checkout.LoyaltySelection {
  return (
    checkout.loyaltySelection ?? {
      source: null,
      points: null,
      amount: null,
      rewardId: null,
    }
  );
}

/**
 * Applies a write to the checkout once its latency passed, or rejects it as the story says.
 */
async function write(
  name: keyof MockFailures,
  apply: (checkout: Checkout.Checkout) => Checkout.Checkout
) {
  await wait();
  const failure = state.failures?.[name];
  if (failure !== undefined) {
    throw failure;
  }
  if (state.checkout) {
    setState({ ...state, checkout: recalculate(apply(state.checkout)) });
  }
}

/**
 * The API of the checkout, answering promo, loyalty, delivery and payment writes as the
 * server would.
 */
function createApi(): CheckoutApi {
  const resolved = () => fn(async () => {});
  return {
    selectDeliveryMethod: fn((input: DeliveryMethodUpdateDto) =>
      write('selectDeliveryMethod', (checkout) =>
        withDeliveryOption(
          checkout,
          input.deliveryGroupId,
          input.optionHandle,
          input.customerInput ?? null
        )
      )
    ).mockName('selectDeliveryMethod'),
    selectPaymentMethod: fn((input: PaymentMethodUpdateDto) =>
      write('selectPaymentMethod', (checkout) => ({
        ...checkout,
        payment: {
          ...checkout.payment,
          selection: {
            status: 'SELECTED',
            method:
              checkout.payment.paymentMethods.find(
                (method) => method.handle === input.methodHandle
              ) ?? null,
            previousMethodHandle: null,
            resetReason: null,
          },
        },
      }))
    ).mockName('selectPaymentMethod'),
    updatePaymentMethod: resolved(),
    updateShippingMethod: fn((input: DeliveryMethodUpdateDto) =>
      write('updateShippingMethod', (checkout) =>
        withDeliveryInput(checkout, input.deliveryGroupId, input.customerInput)
      )
    ).mockName('updateShippingMethod'),
    updateCustomerIdentity: resolved(),
    saveDeliveryAddress: fn((address: CheckoutDeliveryAddressInput) =>
      write('saveDeliveryAddress', (checkout) =>
        withDeliveryAddress(checkout, {
          city: address.city ?? null,
          countryCode: address.countryCode ?? null,
          provinceCode: address.provinceCode ?? null,
          data: address.data ?? null,
        })
      )
    ).mockName('saveDeliveryAddress'),
    removeDeliveryAddresses: resolved(),
    saveDeliveryRecipient: resolved(),
    updateCustomerNote: resolved(),
    addPromoCode: fn(async ({ code }: { code: string }) => {
      await wait();
      const { checkout } = state;
      const normalized = code.trim().toUpperCase();
      // An unknown code is refused, as the API does: the field shows why.
      if (!checkout || !PROMO_CODES[normalized]) {
        throw [
          { code: 'CHECKOUT_DISCOUNT_CODE_INVALID', message: 'Invalid code' },
        ];
      }
      setState({ ...state, checkout: withPromoCode(checkout, normalized) });
    }).mockName('addPromoCode'),
    removePromoCode: fn(async ({ code }: { code: string }) => {
      await wait();
      const { checkout } = state;
      if (!checkout) return;
      setState({
        ...state,
        checkout: recalculate({
          ...checkout,
          promoCodes: checkout.promoCodes.filter(
            (entry) => entry.code !== code
          ),
        }),
      });
    }).mockName('removePromoCode'),
    refreshLoyalty: resolved(),
    submitCheckout: fn(async () => {
      throw new Error('Placing an order is not available in Storybook.');
    }),
    setLoyaltyRedemption: fn(async (request: RedemptionRequest | null) => {
      await wait();
      const { checkout, loyalty } = state;
      if (!checkout) return;
      const option = request
        ? (loyalty.account?.sources.find(
            (item) => item.source === request.source
          ) ?? null)
        : null;
      const redemption =
        request && option ? quoteRedemption(checkout, option, request) : null;
      const selection: Checkout.LoyaltySelection = {
        ...selectionOf(checkout),
        source: request?.source ?? null,
        points: request?.source === 'POINTS' ? request.points : null,
        amount:
          request?.source === 'STORE_CREDIT' && request.amount !== null
            ? money(Number(request.amount), checkout.currencyCode)
            : null,
      };
      setState({
        ...state,
        checkout: {
          ...withRedemption(checkout, redemption),
          loyaltySelection: selection,
        },
      });
    }).mockName('setLoyaltyRedemption'),
    setLoyaltyReward: fn(async (reward: RewardChoice | null) => {
      await wait();
      const { checkout } = state;
      if (!checkout) return;
      setState({
        ...state,
        checkout: withReward(checkout, reward?.id ?? null),
      });
    }).mockName('setLoyaltyReward'),
  };
}

/**
 * Renders the story against `initial`: the checkout data, the loyalty account and an API that
 * applies the buyer's loyalty choices to the checkout, so the block can be clicked through.
 */
export function mockCheckout(initial: Partial<CheckoutMockState> = {}) {
  setState({
    checkout:
      initial.checkout === undefined ? defaultCheckout : initial.checkout,
    loyalty: {
      account: null,
      loading: false,
      failed: false,
      ...initial.loyalty,
    },
    failures: initial.failures,
  });
  const api = createApi();
  const refetch = fn().mockName('refetchLoyaltyAccount');
  const signIn = fn().mockName('signIn');
  const signOut = fn().mockName('signOut');

  mocked(useCheckoutApi).mockImplementation(() => api);
  mocked(useCheckoutData).mockImplementation(() => {
    const { checkout } = useMockState();
    return {
      checkout,
      cart: checkout,
      loading: false,
      loaded: true,
      error: null,
      refetch: async () => undefined,
    };
  });
  mocked(useCheckoutAuth).mockImplementation(() => {
    const customer = useMockState().checkout?.customerIdentity.customer ?? null;
    return {
      status: customer ? 'authenticated' : 'anonymous',
      user: customer?.email
        ? {
            email: customer.email,
            firstName: customer.firstName ?? undefined,
            lastName: customer.lastName ?? undefined,
          }
        : null,
      pending: false,
      onSignIn: signIn,
      onSignOut: signOut,
    };
  });
  const removeLines = fn(async (lines: Checkout.Line[]) => {
    await wait();
    const { checkout } = state;
    if (!checkout) return;
    const ids = new Set(lines.map((line) => line.id));
    const kept = checkout.lines.filter((line) => !ids.has(line.id));
    setState({
      ...state,
      checkout: recalculate({
        ...checkout,
        lines: kept,
        totalQuantity: kept.reduce((sum, line) => sum + line.quantity, 0),
        cost: {
          ...checkout.cost,
          subtotalAmount: {
            ...checkout.cost.subtotalAmount,
            amount: kept.reduce(
              (sum, line) => sum + line.cost.totalAmount.amount,
              0
            ),
          },
        },
        deliveryGroups: checkout.deliveryGroups.filter((group) =>
          group.checkoutLines.some((line) => !ids.has(line.id))
        ),
      }),
    });
  }).mockName('removeCartLines');
  mocked(useRemoveCartLines).mockImplementation(() => ({
    remove: removeLines,
    removing: false,
  }));
  mocked(useLoyaltyAccount).mockImplementation(() => {
    const { loyalty } = useMockState();
    return { ...loyalty, refetch };
  });
}

/** The checkout of the story as it is now, after the buyer's changes. */
export function useMockCheckout(): Checkout.Checkout | null {
  return useMockState().checkout;
}
