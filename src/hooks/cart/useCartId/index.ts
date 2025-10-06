import { cmsPick } from "@src/cms/pick";
import useCartIdShopana from "./useCartId.shopana";
import useCartIdShopify from "./useCartId.shopify";

type UseCartId = () => {
  cartId: string | null;
  loading: boolean;
  loaded: boolean;
};

export default cmsPick({
  shopana: useCartIdShopana,
  shopify: useCartIdShopify,
}) as UseCartId;
