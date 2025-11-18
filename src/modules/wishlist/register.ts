import { registerModule } from '@src/modules/registry';

registerModule('page', 'wishlist', async () => {
  return await import('@src/modules/wishlist/page/page');
});
