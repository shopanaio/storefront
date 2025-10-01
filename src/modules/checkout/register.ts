import { registerModule, ModuleType } from "@src/modules/registry";

/**
 * Registers `checkout` module.
 */
registerModule(ModuleType.Page, "checkout", async () => {
  return await import("@src/modules/checkout/page/page");
});
