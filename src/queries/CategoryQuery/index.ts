import { cmsPick } from '@src/cms/pick';
import CategoryQueryShopana from './CategoryQuery.shopana';
import CategoryQueryShopify from './CategoryQuery.shopify';

export default cmsPick({
  shopana: CategoryQueryShopana,
  shopify: CategoryQueryShopify,
});
