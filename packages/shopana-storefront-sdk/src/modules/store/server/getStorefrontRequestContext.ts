import { cache } from 'react';
import type {
  SdkLocalizationFragment,
  SdkStoreFragment,
} from '../../../graphql/apollo/generated/operations';
import type { ApolloEnvironmentConfig } from '../../../graphql/apollo/types';
import { getApolloRequestClient } from '../../../next/apollo/server';
import { STOREFRONT_LOCALE_HEADER } from '../../localization/core/constants';
import type { StorefrontLocale } from '../../localization/core/locale';
import type { StorefrontLocales } from '../../localization/core/types';
import {
  loadStorefrontLocales,
  resolveStorefrontLocale,
} from '../../localization/server/loadStorefrontLocales';
import { loadStorefrontContext } from './loadStorefrontContext';

export interface StorefrontRequestContext {
  store: SdkStoreFragment;
  localization: SdkLocalizationFragment;
  /** Locale of the request, from the URL locale segment the middleware resolved. */
  locale: StorefrontLocale;
  locales: StorefrontLocales;
}

/**
 * Store, languages and localization of the current server request, loaded once per request with
 * the request-scoped client; layouts, metadata and `AppProvider` share the result.
 */
export const getStorefrontRequestContext = cache(
  async (
    environmentConfig: ApolloEnvironmentConfig
  ): Promise<StorefrontRequestContext> => {
    const { headers } = await import('next/headers');
    const requestLocale = (await headers()).get(STOREFRONT_LOCALE_HEADER);
    const locales = await loadStorefrontLocales(environmentConfig);
    const client = await getApolloRequestClient(environmentConfig);
    const { store, localization } = await loadStorefrontContext(client);
    return {
      store,
      localization,
      locale: resolveStorefrontLocale(locales, requestLocale),
      locales,
    };
  }
);
