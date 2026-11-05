/**
 * `STOREFRONT_APOLLO_CLIENT_NORMALIZATION=1`: the server keeps responses whole and the browser
 * normalizes them. Read once, as the server process starts; the browser never has it.
 */
export const clientNormalization =
  typeof window === 'undefined' &&
  ['1', 'true'].includes(
    process.env.STOREFRONT_APOLLO_CLIENT_NORMALIZATION ?? ''
  );
