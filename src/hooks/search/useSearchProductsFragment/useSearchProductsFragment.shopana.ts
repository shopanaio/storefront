import SearchProductsFragment from "@src/hooks/search/SearchProductsFragment";
import { SearchProductsFragment$key } from "@src/relay/queries/__generated__/SearchProductsFragment.graphql";
import { useFragment } from "react-relay";


const useSearchProductsFragment = (data: SearchProductsFragment$key) => {
  return useFragment(SearchProductsFragment, data.products);
};

export default useSearchProductsFragment;