import { loadSerializableQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { createFetchGraphQL } from '../../../../graphql/relay/Environment';
import type { RelayEnvironmentConfig } from '../../../../graphql/relay/types';
import ProductQueryNode, {
  ProductComponentSelectionInput,
  ProductQuery as ProductQueryType,
  ReviewSort,
} from '../../core/graphql/queries/__generated__/ProductQuery.graphql';

export type ProductReviewSort = ReviewSort;

export interface LoadProductServerQueryOptions {
  environmentConfig: RelayEnvironmentConfig;
  handle: string;
  reviewsFirst?: number;
  reviewsSort?: ProductReviewSort;
  componentSelections?: ReadonlyArray<ProductComponentSelectionInput>;
}

export async function loadProductServerQuery(
  options: LoadProductServerQueryOptions,
): Promise<
  SerializablePreloadedQuery<typeof ProductQueryNode, ProductQueryType>
> {
  const {
    environmentConfig,
    handle,
    reviewsFirst = 3,
    reviewsSort = 'MOST_HELPFUL',
    componentSelections,
  } = options;

  const { headers } = await import('next/headers');
  const cookie = (await headers()).get('cookie') ?? undefined;

  const networkFetch = createFetchGraphQL({
    graphqlUrl: environmentConfig.graphqlUrl,
    apiKeyHeader: environmentConfig.apiKeyHeader,
    apiKey: environmentConfig.apiKey,
    accessTokenCookieName: environmentConfig.accessTokenCookieName,
    serverCookies: cookie,
  });

  const preloadedQuery = await loadSerializableQuery<
    typeof ProductQueryNode,
    ProductQueryType
  >(networkFetch, ProductQueryNode.params, {
    handle,
    first: reviewsFirst,
    sort: reviewsSort,
    componentSelections,
  }, cookie);

  return preloadedQuery;
}

export type { ProductQueryType };
