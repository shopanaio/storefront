import { loadCartQuery as LoadCartQueryShopify } from './loadCartQuery.shopify';
import { loadCartQuery as LoadCartQueryShopana } from './loadCartQuery.shopana';
import { cmsPick } from '@src/cms/pick';

const loadCartQuery = cmsPick({
  shopana: LoadCartQueryShopana,
  shopify: LoadCartQueryShopify,
});

export default loadCartQuery;
