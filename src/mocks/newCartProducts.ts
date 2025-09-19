import { ApiCartLine, CurrencyCode } from "@codegen/schema-client";
import { mockProduct } from "./Product";

export const newMockCartProducts: ApiCartLine[] = [
  {
    __typename: "CartLine",
    id: "1",
    iid: "uuid-1",
    quantity: 4,

    appliedDiscounts: [{
      __typename: 'AppliedDiscount',
      amount: {
        __typename: 'Money',
        amount: 10,
        currencyCode: CurrencyCode.Usd,
      },
      code: "sale-20",
      id: '1',
    }],
    appliedTaxLines: [{
      __typename: 'TaxLine',
      amountCollected: {
        __typename: 'Money',
        amount: 10,
        currencyCode: CurrencyCode.Usd,
      },
      id: 'tax-id-1',
      iid: 'tax-iod-1',
      rate: 0.2,
      title: 'VAT',
    }],
    /** Cost calculations for this cart item. */
    cost: {
      __typename: 'CartLineCost',
      /** The original list price per unit before any discounts. */
      compareAtUnitPrice: {
        __typename: 'Money',
        amount: 2500,
        currencyCode: CurrencyCode.Usd,
      },
      /** Discount amount applied to a single unit. */
      discountAmount: {
        __typename: 'Money',
        amount: 10,
        currencyCode: CurrencyCode.Usd,
      },
      /** Total cost of all units before discounts. */
      subtotalAmount: {
        __typename: 'Money',
        amount: 10000,
        currencyCode: CurrencyCode.Usd,
      },
      /** Total tax amount applied to the cart line. */
      taxAmount: {
        __typename: 'Money',
        amount: 2000,
        currencyCode: CurrencyCode.Usd,
      },
      /** Final total cost for the cart line, including all discounts, taxes, and any additional fees. */
      totalAmount: {
        __typename: 'Money',
        amount: 11950,
        currencyCode: CurrencyCode.Usd,
      },
      /** The current price per unit before discounts are applied (may differ from compareAt price if on sale). */
      unitPrice: {
        __typename: 'Money',
        amount: 2400,
        currencyCode: CurrencyCode.Usd,
      },
    },
    /** The purchasable item added to the cart, such as a product or bundle. */
    purchasable: mockProduct,
  },
];
