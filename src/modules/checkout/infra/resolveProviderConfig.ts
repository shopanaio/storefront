import { moduleRegistry } from '@src/modules/registry';
import {
  ProviderConfig,
  ProviderModuleType,
} from '@src/modules/checkout/vendors/types';

/**
 * Resolve provider method-level schema from the module registry.
 * Returns null if provider/module not found or no schema is provided.
 */
export async function resolveProviderConfig(
  moduleType: ProviderModuleType,
  provider: string
): Promise<ProviderConfig | null> {
  const loader = moduleRegistry.resolve<{
    Component: unknown;
    config?: ProviderConfig;
  }>(moduleType, provider);
  if (!loader) {
    return null;
  }

  const api = await loader();
  console.log('api ---->', api);
  // If loader is async, skip schema resolution (no await in sync yup context)
  if (api instanceof Promise) {
    return null;
  }

  // If no methods are provided, skip schema resolution
  if (!api.config?.methods.length) {
    return null;
  }

  return api?.config;
}
