import SearchProductsFragment from '@src/hooks/search/SearchProductsFragment';
import type { StorefrontSearchProductsFragment } from '../../../../codegen/apollo/storefront-operations';
import { useFragment } from '@shopana/storefront-sdk/graphql/apollo';
const useSearchProductsFragment = (data: StorefrontSearchProductsFragment) => {
  return useFragment(SearchProductsFragment, data);
};
export default useSearchProductsFragment;
