import { ApiFilter, ApiListFilter, ApiPriceRangeFilter, CurrencyCode } from "@codegen/schema-client";

// Interface for Shopify filter
interface ShopifyFilter {
  id: string;
  type: string;
  label: string;
  count?: number;
  minPrice?: { amount: number; currencyCode: string };
  maxPrice?: { amount: number; currencyCode: string };
  values?: Array<{
    id: string;
    label: string;
    count?: number;
    input?: string;
  }>;
}

// Interface for parsing JSON from input
interface PriceRangeInput {
  price: {
    min: number;
    max: number;
  };
}

const useFilters = (filters: readonly ShopifyFilter[]): ApiFilter[] => {
  // Convert Shopify filters to Shopana format
  return filters.map(filter => {
    // If this is a price filter
    if (filter.type === "PRICE_RANGE") {
      let minAmount;
      let maxAmount;
      let currencyCode: CurrencyCode = CurrencyCode.Usd;

      // Try to extract values from values.input
      if (filter.values && filter.values.length > 0) {
        const firstValue = filter.values[0];
        if (firstValue.input) {
          try {
            const parsedInput: PriceRangeInput = JSON.parse(firstValue.input);
            if (parsedInput.price) {
              minAmount = parsedInput.price.min;
              maxAmount = parsedInput.price.max;
            }
          } catch (error) {
            console.warn("Failed to parse price range input:", firstValue.input, error);
          }
        }
      }

      // Use values from input if they exist, otherwise fallback to filter.minPrice/maxPrice
      minAmount = filter.minPrice?.amount || minAmount;
      maxAmount = filter.maxPrice?.amount || maxAmount;
      currencyCode = (filter.minPrice?.currencyCode as CurrencyCode) || CurrencyCode.Usd;

      return {
        id: filter.id,
        iid: filter.id,
        handle: filter.label,
        title: filter.label,
        type: "PRICE_RANGE",
        minPrice: { amount: minAmount, currencyCode },
        maxPrice: { amount: maxAmount, currencyCode },
        count: filter.count || 0,
      } as ApiPriceRangeFilter;
    }

    // For other filter types
    return {
      id: filter.id,
      iid: filter.id,
      handle: filter.label,
      title: filter.label,
      type: filter.type || "LIST",
      values: filter.values?.map((value) => ({
        id: value.id,
        iid: value.id,
        handle: value.label,
        title: value.label,
        count: value.count || 0,
        input: value.input,
      })) || [],
    } as ApiListFilter;
  });
};

export default useFilters;
