import { ModuleType, registerModule } from '@src/modules/registry';

/**
 * Registers the bank_transfer payment provider module.
 */
registerModule(ModuleType.Payment, 'bank_transfer', async () => {
  const api = await import('./module.payment');
  return api.default;
});
