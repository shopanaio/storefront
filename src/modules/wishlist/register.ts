import { registerModule } from '@shopana/storefront-sdk/registry';

registerModule({
  type: 'page',
  slug: 'wishlist',
  path: '/wishlist',
  loader: async () => import('@src/modules/wishlist/page/page'),
});
