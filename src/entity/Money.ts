import { CurrencyCode } from "@codegen/schema-client";

export interface Money {
  amount: string;
  currencyCode: CurrencyCode;
}
