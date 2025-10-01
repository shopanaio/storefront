import type { ShippingProviderModuleApi } from "@src/modules/registry";
import { NovaPoshtaProvider } from "./components/Provider";

/**
 * Nova Poshta shipping module API that can be consumed by checkout.
 */
const shippingProviderModule: ShippingProviderModuleApi = {
  provider: "novaposhta",
  label: "Nova Poshta",
  Component: NovaPoshtaProvider,
};

export default shippingProviderModule;
