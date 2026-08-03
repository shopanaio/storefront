import { markets } from "./markets.js";
import { store } from "./store.js";

const market = markets[0];

export const localization = {
  storeId: store.id,
  marketId: market.id,
  country: market.defaultCountry,
  language: market.defaultLanguage,
  currency: market.defaultCurrency,
  availableCountries: market.countries,
  availableLanguages: market.languages,
  availableCurrencies: market.currencies,
};
