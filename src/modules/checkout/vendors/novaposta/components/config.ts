import type { FC } from "react";
import { NPLogo as LogoComponent } from "@src/modules/checkout/vendors/novaposta/components/common/Logo";
import { AddressForm } from "./forms/AddressForm";
import { WarehouseForm } from "./forms/WarehouseForm";

/**
 * Nova Poshta provider configuration: shipping and payment options
 */
export interface ProviderOptionConfig {
  /** Unique code identifier used internally */
  code: string;
  /** Human-readable method name for UI */
  name: string;
  /** i18n translation key */
  nameI18n?: string;
  /** Short description rendered in UI */
  description?: string;
  /** React form component to render inside method panel */
  Component: FC | null;
}

export interface NovaPoshtaProviderConfig {
  logo: FC<{ size?: number }>;
  shipping: ProviderOptionConfig[];
  payment: ProviderOptionConfig[];
}

export const NOVA_POSHTA_CONFIG: NovaPoshtaProviderConfig = {
  logo: LogoComponent,
  shipping: [
    {
      code: "warehouse_warehouse",
      name: "Branch pickup",
      nameI18n: "shipping.warehouse",
      Component: WarehouseForm,
    },
    {
      code: "warehouse_doors",
      name: "Courier to door",
      nameI18n: "shipping.courier",
      Component: AddressForm,
    },
  ],
  payment: [
    {
      code: "cod",
      name: "Cash on delivery",
      nameI18n: "shipping.cod",
      Component: null,
    },
  ],
};
