import { registerModule } from "@src/modules/registry";

/**
 * Registers `checkout` module.
 */
registerModule("checkout", async () => {
  return await import("@src/modules/checkout/page/page");
});
