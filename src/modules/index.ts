export {
  moduleRegistry,
  registerModule,
  ModuleType,
  type ModuleSlug,
  type AsyncModuleLoader,
  type RegisteredModuleRecord,
  type DynamicModulePageProps,
  type ModuleExport,
} from "./registry";

/**
 * Auto-discovers and imports all `register.ts` files under `src/modules/**`.
 * This enables plugin-style modules (e.g., via git submodules) without
 * changing the main app. Webpack will include all matching files.
 */
const context = require.context("./", true, /register\.(t|j)sx?$/);
context.keys().forEach((key) => context(key));
