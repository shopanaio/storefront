import {
  StorefrontUseListingProductCardFragment_ProductFragmentDoc,
  type StorefrontUseListingProductCardFragment_ProductFragment,
} from '../../../../codegen/apollo/storefront-operations';
import { useFragment } from '@shopana/storefront-sdk/graphql/apollo';
const UseProductCardFragment =
  StorefrontUseListingProductCardFragment_ProductFragmentDoc;
const useListingProductCardFragment = (
  ref: StorefrontUseListingProductCardFragment_ProductFragment | null
) => {
  return useFragment(UseProductCardFragment, ref);
};
export default useListingProductCardFragment;
