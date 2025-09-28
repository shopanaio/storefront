import { Money } from "@src/entity/Money";
import { Product } from "@src/entity/Product/interface";

type CartPurchasable = Product;

interface CartLine {
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

interface Cart {
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

export type { Cart, CartLine, CartPurchasable };
