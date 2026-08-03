import { gid } from "../shared.js";

const languages = {
  en: { code: "en", name: "English" },
  de: { code: "de", name: "Deutsch" },
  fr: { code: "fr", name: "Français" },
};

const currencies = {
  USD: { code: "USD", name: "US Dollar", symbol: "$" },
  EUR: { code: "EUR", name: "Euro", symbol: "€" },
  GBP: { code: "GBP", name: "Pound Sterling", symbol: "£" },
};

const countries = {
  US: { code: "US", name: "United States" },
  CA: { code: "CA", name: "Canada" },
  GB: { code: "GB", name: "United Kingdom" },
  DE: { code: "DE", name: "Germany" },
  FR: { code: "FR", name: "France" },
};

export const markets = [
  {
    id: gid("Market", "north-america"),
    handle: "north-america",
    name: "North America",
    countries: [countries.US, countries.CA],
    languages: [languages.en, languages.fr],
    currencies: [currencies.USD],
    defaultCountry: countries.US,
    defaultLanguage: languages.en,
    defaultCurrency: currencies.USD,
    timezone: "America/New_York",
    taxIncluded: false,
  },
  {
    id: gid("Market", "united-kingdom"),
    handle: "united-kingdom",
    name: "United Kingdom",
    countries: [countries.GB],
    languages: [languages.en],
    currencies: [currencies.GBP],
    defaultCountry: countries.GB,
    defaultLanguage: languages.en,
    defaultCurrency: currencies.GBP,
    timezone: "Europe/London",
    taxIncluded: true,
  },
  {
    id: gid("Market", "europe"),
    handle: "europe",
    name: "European Union",
    countries: [countries.DE, countries.FR],
    languages: [languages.en, languages.de, languages.fr],
    currencies: [currencies.EUR],
    defaultCountry: countries.DE,
    defaultLanguage: languages.en,
    defaultCurrency: currencies.EUR,
    timezone: "Europe/Berlin",
    taxIncluded: true,
  },
];
