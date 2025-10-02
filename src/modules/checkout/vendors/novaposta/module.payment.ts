import type { PaymentProviderModuleApi } from "@src/modules/registry";
import { NPPaymentProvider } from "./components/PaymentProvider";

const paymentProviderModule: PaymentProviderModuleApi = {
  provider: "novaposhta",
  label: "Nova Poshta (Payment)",
  Component: NPPaymentProvider,
};

export default paymentProviderModule;
