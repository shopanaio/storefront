import type { PaymentProviderModuleApi } from "@src/modules/registry";
import { NovaPoshtaPaymentProvider } from "./components/PaymentProvider";

const paymentProviderModule: PaymentProviderModuleApi = {
  provider: "novaposhta",
  label: "Nova Poshta (Payment)",
  Component: NovaPoshtaPaymentProvider,
};

export default paymentProviderModule;
