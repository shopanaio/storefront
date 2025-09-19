import SearchProductsFragment from "@src/hooks/search/SearchProductsFragment";
import { SearchProductsFragment$key } from "@src/relay/queries/__generated__/SearchProductsFragment.graphql";
import { useFragment } from "react-relay";


const useSearchProductsFragment = (data: SearchProductsFragment$key) => {
  const fragmentData = useFragment(SearchProductsFragment, data);

  const transformedData = {
    edges: fragmentData.edges,
    pageInfo: fragmentData.pageInfo,
    totalCount: fragmentData.totalCount,
    filters: fragmentData.productFilters,
  };

  return transformedData;
};

export default useSearchProductsFragment;