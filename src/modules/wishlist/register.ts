import { registerModule } from '@shopana/storefront-sdk/registry';

registerModule('page', 'wishlist', async () => {
  return await import('@src/modules/wishlist/page/page');
});
