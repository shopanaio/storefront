import type { SdkStoreFragment } from '../../../graphql/apollo/generated/operations';
import type { ApolloEnvironmentConfig } from '../../../graphql/apollo/types';
import { getApolloRequestClient } from '../../../server/apollo';
import { apolloEnvironmentKey } from '../../../server/requestClient';
import {
  cacheForRequest,
  readServerRequestHeaders,
} from '../../../server/requestScope';
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
  /** Locale of the request, from the URL locale segment the middleware resolved. */
  locale: StorefrontLocale;
  locales: StorefrontLocales;
}

/**
 * Store and languages of the current server request, loaded once per request with the
 * request-scoped client; layouts, metadata and `AppProvider` share the result.
 */
export const getStorefrontRequestContext = cacheForRequest(
  async (
    environmentConfig: ApolloEnvironmentConfig
  ): Promise<StorefrontRequestContext> => {
    const requestLocale = (await readServerRequestHeaders()).get(
      STOREFRONT_LOCALE_HEADER
    );
    const locales = await loadStorefrontLocales(environmentConfig);
    const client = await getApolloRequestClient(environmentConfig);
    const { store } = await loadStorefrontContext(client);
    return {
      store,
      locale: resolveStorefrontLocale(locales, requestLocale),
      locales,
    };
  },
  apolloEnvironmentKey
);
