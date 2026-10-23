import type { Checkout } from '#checkout/types/entity';

/** LiqPay as the app returns it: the buyer pays on the LiqPay page after placing the order. */
export const LIQPAY: Checkout.PaymentMethod = {
  handle: 'liqpay',
  code: 'liqpay',
  title: 'liqpay',
  flow: 'ONLINE',
  provider: { code: 'liqpay' },
};

/** Cash on delivery of Nova Poshta, offered with Nova Poshta delivery. */
export const NOVA_POSHTA_COD: Checkout.PaymentMethod = {
  handle: 'nova-poshta-cod',
  code: 'nova-poshta-cod',
  title: 'nova-poshta-cod',
  flow: 'ON_DELIVERY',
  provider: { code: 'nova-poshta' },
};

/** Payment of a scenario: the methods offered and the selected one, or the reset of it. */
export function payment(
  payable: Checkout.Payment['payableAmount'],
  {
    methods = [LIQPAY, NOVA_POSHTA_COD],
    selected = null,
    reset,
  }: {
    methods?: Checkout.PaymentMethod[];
    selected?: string | null;
    reset?: { handle: string; reason: Checkout.SelectionResetReason };
  } = {}
): Checkout.Payment {
  const method = methods.find((item) => item.handle === selected) ?? null;
  return {
    payableAmount: payable,
    paymentMethods: methods,
    selection: reset
      ? {
          status: 'RESET',
          method: null,
          previousMethodHandle: reset.handle,
          resetReason: reset.reason,
        }
      : {
          status: method ? 'SELECTED' : 'NONE',
          method,
          previousMethodHandle: null,
          resetReason: null,
        },
  };
}
