import { ModuleType, registerModule } from "@src/modules/registry";

/**
 * Register delivery-related modules (shipping methods).
 */
registerModule(ModuleType.Shipping, "novaposhta", async () => {
  const api = await import("./module");
  return api.default;
});

registerModule(ModuleType.Payment, "novaposhta", async () => {
  const api = await import("./payment.module");
  return api.default;
});
