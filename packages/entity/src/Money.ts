import { CurrencyCode } from "@codegen/schema-client";

/**
 * Money entity
 */
export interface Money {
  amount: string;
  currencyCode: CurrencyCode;
}
