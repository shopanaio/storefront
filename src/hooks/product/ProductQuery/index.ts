import { cmsPick } from "@src/cms/pick";
import ProductQueryShopana from "./ProductQuery.shopana";
import ProductQueryShopify from "./ProductQuery.shopify";

// Export multi-project query
export const ProductQuery = cmsPick({
  shopana: ProductQueryShopana,
  shopify: ProductQueryShopify,
});

// Export default for backward compatibility
export default ProductQuery;
