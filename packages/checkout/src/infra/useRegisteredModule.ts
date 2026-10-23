import { use } from 'react';
import type { ProviderModuleType } from '#checkout/vendors/types';
import { loadModule } from './loadCache';

/**
 * The module registered under `type`/`slug`, read while rendering: the component suspends
 * until the module is loaded (the nearest `LoadingBoundary` shows its skeleton meanwhile) and a
 * module loaded before renders at once. A module that fails to load throws a `LoadError`, which
 * the boundary shows with a "Retry". `api` is `null` only when nothing is registered.
 */
export function useRegisteredModule<T>(
  type: ProviderModuleType,
  slug: string | null
): { found: boolean; api: T | null } {
  const load = slug ? loadModule<T>(type, slug) : null;
  return { found: load !== null, api: load ? use(load) : null };
}
