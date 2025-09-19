import { useCartLineFragment_CartLineFragment$key } from "./__generated__/useCartLineFragment_CartLineFragment.graphql";
import useCartLineFragmentShopify from "./useCartLineFragment.shopify";
import useCartLineFragmentShopana from "./useCartLineFragment.shopana";
import { cmsPick } from "@src/cms/pick";

const useCartLineFragment = (cartLineKey: useCartLineFragment_CartLineFragment$key) => {

  return cmsPick({
    shopana: useCartLineFragmentShopana,
    shopify: useCartLineFragmentShopify,
  })(cartLineKey);
};

export default useCartLineFragment;