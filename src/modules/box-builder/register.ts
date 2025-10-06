import { registerModule } from '@src/modules/registry';

/**
 * Registers `box-builder` module.
 * Component path: `@src/modules/box-builder/page/page` (server component exporting default).
 */
registerModule('page', 'box-builder', async () => {
  return await import('@src/modules/box-builder/page/page');
});
