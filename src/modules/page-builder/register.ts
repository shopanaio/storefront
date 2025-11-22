import { registerModule } from '@src/modules/registry';

registerModule('page', 'page-builder', async () => {
  return await import('@src/modules/page-builder/page/page');
});
