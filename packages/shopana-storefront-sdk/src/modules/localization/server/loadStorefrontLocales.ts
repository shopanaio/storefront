import { print } from 'graphql';
import {
  SdkStorefrontLocalesDocument,
  type SdkStorefrontLocalesQuery,
} from '../../../graphql/apollo/generated/operations';
import type { ApolloEnvironmentConfig } from '../../../graphql/apollo/types';
import { STOREFRONT_LOCALES_TTL_MS } from '../core/constants';
import { findStorefrontLocale, toStorefrontLocale } from '../core/locale';
import type { StorefrontLocales } from '../core/types';

interface CachedLocales {
  value: StorefrontLocales;
  expiresAt: number;
}

const cache = new Map<string, CachedLocales>();
const pending = new Map<string, Promise<StorefrontLocales>>();
const query = print(SdkStorefrontLocalesDocument);

function environmentKey(config: ApolloEnvironmentConfig): string {
  return JSON.stringify([config.graphqlUrl, config.apiKeyHeader, config.apiKey]);
}

export function toStorefrontLocales(
  data: Pick<SdkStorefrontLocalesQuery, 'store' | 'localization'>
): StorefrontLocales {
  const locales = data.localization.availableLanguages.map(toStorefrontLocale);
  const defaultLocale =
    findStorefrontLocale(locales, data.store.defaultLocale) ??
    toStorefrontLocale({
      code: data.store.defaultLocale,
      name: data.store.defaultLocale,
    });
  return {
    defaultLocale,
    locales: locales.some((locale) => locale.code === defaultLocale.code)
      ? locales
      : [defaultLocale, ...locales],
  };
}

async function fetchStorefrontLocales(
  config: ApolloEnvironmentConfig
): Promise<StorefrontLocales> {
  const response = await fetch(config.graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [config.apiKeyHeader]: config.apiKey,
    },
    body: JSON.stringify({ operationName: 'SdkStorefrontLocales', query }),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Store languages request failed with ${response.status}`);
  }
  const payload = (await response.json()) as {
    data?: SdkStorefrontLocalesQuery;
    errors?: unknown[];
  };
  if (!payload.data || payload.errors?.length) {
    throw new Error('Store languages response has no data');
  }
  return toStorefrontLocales(payload.data);
}

/**
 * Store languages for routing, shared by the middleware and server rendering. A failed refresh
 * keeps serving the last known languages; without them the error is thrown.
 */
export async function loadStorefrontLocales(
  config: ApolloEnvironmentConfig
): Promise<StorefrontLocales> {
  const key = environmentKey(config);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  let request = pending.get(key);
  if (!request) {
    request = fetchStorefrontLocales(config)
      .then((value) => {
        cache.set(key, {
          value,
          expiresAt: Date.now() + STOREFRONT_LOCALES_TTL_MS,
        });
        return value;
      })
      .catch((error: unknown) => {
        if (cached) return cached.value;
        throw error;
      })
      .finally(() => pending.delete(key));
    pending.set(key, request);
  }
  return request;
}

/** URL segment of the request locale; the store default when the segment is unknown. */
export function resolveStorefrontLocale(
  locales: StorefrontLocales,
  segment: string | null | undefined
) {
  return findStorefrontLocale(locales.locales, segment) ?? locales.defaultLocale;
}
