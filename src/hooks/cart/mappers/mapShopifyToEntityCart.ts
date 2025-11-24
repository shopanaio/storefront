import type { model } from '@shopana/storefront-sdk';

export function mapShopifyCartToEntityCart(cart: any): model.Cart | null {
  if (!cart) return null;
  const currency = cart?.cost?.totalAmount?.currencyCode || cart?.cost?.subtotalAmount?.currencyCode || 'USD';

  const edges = cart?.lines?.edges || [];
  const lines: model.Cart['lines'] = edges.map((edge: any) => {
    const node = edge?.node;
    const merch = node?.merchandise;
    const unitMoney = node?.cost?.amountPerQuantity || merch?.price;
    const compareMoney = node?.cost?.compareAtAmountPerQuantity || merch?.compareAtPrice;
    const unitAmount = Number(unitMoney?.amount ?? 0);
    const unitCurrency = unitMoney?.currencyCode || currency;
    const subtotalAmount = Number(node?.cost?.subtotalAmount?.amount ?? unitAmount * Number(node?.quantity ?? 0));
    const totalAmount = Number(node?.cost?.totalAmount?.amount ?? subtotalAmount);

    return {
      id: node?.id,
      quantity: Number(node?.quantity ?? 0),
      purchasableId: merch?.id,
      purchasable: merch as any,
      cost: {
        unitPrice: { amount: unitAmount, currencyCode: unitCurrency },
        compareAtUnitPrice: compareMoney ? { amount: Number(compareMoney.amount ?? 0), currencyCode: compareMoney.currencyCode || unitCurrency } : null,
        subtotalAmount: { amount: subtotalAmount, currencyCode: currency },
        totalAmount: { amount: totalAmount, currencyCode: currency },
      },
    };
  });

  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? lines.reduce((a, l) => a + l.cost.subtotalAmount.amount, 0));
  const total = Number(cart?.cost?.totalAmount?.amount ?? lines.reduce((a, l) => a + l.cost.totalAmount.amount, 0));

  return {
    id: cart.id,
    createdAt: new Date(cart.createdAt),
    updatedAt: new Date(cart.updatedAt),
    totalQuantity: Number(cart.totalQuantity ?? lines.reduce((a, l) => a + l.quantity, 0)),
    cost: {
      subtotalAmount: { amount: subtotal, currencyCode: currency },
      totalAmount: { amount: total, currencyCode: currency },
      totalDiscountAmount: { amount: 0, currencyCode: currency },
      totalTaxAmount: { amount: 0, currencyCode: currency },
      totalShippingAmount: { amount: Number(cart?.cost?.checkoutChargeAmount?.amount ?? 0), currencyCode: cart?.cost?.checkoutChargeAmount?.currencyCode || currency },
    },
    lines,
  };
}
