import { useEffect, useState, useSyncExternalStore } from 'react';
import { fn, mocked } from 'storybook/test';
import type {
  CustomerIdentityUpdateDto,
  CustomerNoteUpdateDto,
  DeliveryMethodUpdateDto,
  PaymentMethodUpdateDto,
} from '#checkout/api/dto';
import type { CheckoutApi } from '#checkout/api/interface';
import type {
  CheckoutDeliveryAddressInput,
  CheckoutRecipientInput,
} from '#checkout/graphql/operations';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import {
  useCheckoutAuth,
  useSaveCheckoutInput,
} from '#checkout/hooks/useCheckoutAuth';
import { useCheckoutSignIn } from '#checkout/context/CheckoutSignInContext';
import { useLoginIdentifier } from '@shopana/storefront-auth/ui';
import { mockSession, type MockSessionOptions } from './mockAuth';
import { useDefaultCartCleanup } from '#checkout/hooks/useDefaultCartCleanup';
import { useLoyaltyAccount } from '#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount';
import { useStorePolicy } from '#checkout/hooks/useStorePolicy';
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
import { storePolicies } from './policyFixtures';
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
  /** The storefront session and the headless sign-in (`mockAuth`). */
  session?: MockSessionOptions;
}

/** Writes of the form a story can make fail. */
export type MockFailures = Partial<
  Record<
    | 'selectDeliveryMethod'
    | 'updateShippingMethod'
    | 'selectPaymentMethod'
    | 'saveDeliveryAddress'
    | 'updateCustomerIdentity'
    | 'saveDeliveryRecipient'
    | 'updateCustomerNote',
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
 * The API of the checkout, answering contact, recipient, note, promo, loyalty, delivery and
 * payment writes as the server would.
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
    updateCustomerIdentity: fn((input: CustomerIdentityUpdateDto) =>
      write('updateCustomerIdentity', (checkout) => {
        const identity = { ...checkout.customerIdentity };
        for (const key of [
          'email',
          'firstName',
          'lastName',
          'middleName',
          'phone',
        ] as const) {
          if (input[key] !== undefined) identity[key] = input[key] ?? null;
        }
        return { ...checkout, customerIdentity: identity };
      })
    ).mockName('updateCustomerIdentity'),
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
    saveDeliveryRecipient: fn((recipient: CheckoutRecipientInput | null) =>
      write('saveDeliveryRecipient', (checkout) => ({
        ...checkout,
        deliveryGroups: checkout.deliveryGroups.map((group) => ({
          ...group,
          recipient: recipient && {
            email: recipient.email ?? null,
            firstName: recipient.firstName ?? null,
            lastName: recipient.lastName ?? null,
            middleName: recipient.middleName ?? null,
            phone: recipient.phone ?? null,
          },
        })),
      }))
    ).mockName('saveDeliveryRecipient'),
    updateCustomerNote: fn((input: CustomerNoteUpdateDto) =>
      write('updateCustomerNote', (checkout) => ({
        ...checkout,
        customerNote: input.note || null,
      }))
    ).mockName('updateCustomerNote'),
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
    session: initial.session,
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
  const auth = mockSession(initial.session, {
    useCustomer: () =>
      useMockState().checkout?.customerIdentity.customer ?? null,
    setCustomer: (customer, phone) => {
      const { checkout } = state;
      if (!checkout) return;
      const identity = checkout.customerIdentity;
      // The account claims the checkout: its contact fills what the buyer left empty (F1).
      setState({
        ...state,
        checkout: {
          ...checkout,
          customerIdentity: customer
            ? {
                ...identity,
                customer,
                firstName: identity.firstName || customer.firstName,
                lastName: identity.lastName || customer.lastName,
                email: customer.email ?? identity.email,
                phone: phone ?? identity.phone,
              }
            : { ...identity, customer: null },
        },
      });
    },
  });
  mocked(useCheckoutAuth).mockImplementation(() => {
    const customer = useMockState().checkout?.customerIdentity.customer ?? null;
    const identifier = useLoginIdentifier();
    const { requestSignIn } = useCheckoutSignIn();
    return {
      status: customer ? 'authenticated' : 'anonymous',
      user: customer
        ? {
            email: customer.email ?? '',
            firstName: customer.firstName ?? undefined,
            lastName: customer.lastName ?? undefined,
            identifier: identifier?.display ?? customer.email ?? '',
          }
        : null,
      pending: false,
      // "Log in" leads to the sign-in of the page, as in the app.
      onSignIn: () => {
        signIn();
        requestSignIn();
      },
      onSignOut: () => {
        signOut();
        auth.signOut();
      },
    };
  });
  // Saving the typed input before a social sign-in goes through the cart, which stories lack.
  mocked(useSaveCheckoutInput).mockImplementation(() => async () => undefined);
  const cleanupCart = fn().mockName('cleanupCart');
  mocked(useDefaultCartCleanup).mockImplementation(() => cleanupCart);
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
  mocked(useStorePolicy).mockImplementation(useMockStorePolicy);
}

/** A published policy of `storePolicies`, read with the latency of the mock API. */
function useMockStorePolicy(handle: string | null) {
  const [loaded, setLoaded] = useState<string | null>(null);
  useEffect(() => {
    if (!handle) return;
    const timer = setTimeout(() => setLoaded(handle), LATENCY_MS);
    return () => clearTimeout(timer);
  }, [handle]);
  const ready = handle !== null && loaded === handle;
  return {
    policy: ready
      ? (storePolicies.find((policy) => policy.handle === handle) ?? null)
      : null,
    loading: handle !== null && !ready,
  };
}

/** The checkout of the story as it is now, after the buyer's changes. */
export function useMockCheckout(): Checkout.Checkout | null {
  return useMockState().checkout;
}
