import type { Money } from "../Money";
import type { ProductVariant } from "../Product/variant";

export type CartPurchasable = ProductVariant;

export interface CartLine {
  id: string;
  quantity: number;
  purchasableId: string;
  purchasable: CartPurchasable;
  cost: {
    unitPrice: Money;
    compareAtUnitPrice: Money | null;
    subtotalAmount: Money;
    totalAmount: Money;
  };
}

export interface Cart {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalDiscountAmount: Money | null;
    totalTaxAmount: Money | null;
    totalShippingAmount: Money | null;
  };
  lines: CartLine[];
}
