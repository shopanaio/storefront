/**
 * Request header with the BCP 47 tag of the request locale (`uk`, `pt-BR`), set by the runtime
 * middleware after it matched the URL locale segment against the store languages.
 */
export const STOREFRONT_LOCALE_HEADER = 'x-shopana-locale';

/** How long the server keeps the store languages before asking the API again. */
export const STOREFRONT_LOCALES_TTL_MS = 60_000;
