import type { FC } from 'react';
import { NPLogo as LogoComponent } from './Logo';
import { WarehouseShippingMethod } from './methods/WarehouseShippingMethod';
import { CourierShippingMethod } from './methods/CourierShippingMethod';
import { CodPaymentMethod } from './methods/CodPaymentMethod';

/**
 * Nova Poshta provider configuration: shipping and payment options
 */
export interface ProviderMethodConfig {
  /** Unique code identifier used internally */
  code: string;
  /** Full method component that includes CheckoutMethodPanel */
  Component: FC<{
    isActive: boolean;
    onActivate: () => void;
  }>;
}

export interface NovaPoshtaProviderConfig {
  logo: FC<{ size?: number }>;
  shipping: ProviderMethodConfig[];
  payment: ProviderMethodConfig[];
}

export const NOVA_POSHTA_CONFIG: NovaPoshtaProviderConfig = {
  logo: LogoComponent,
  shipping: [
    {
      code: 'warehouse_warehouse',
      Component: WarehouseShippingMethod,
    },
    {
      code: 'warehouse_doors',
      Component: CourierShippingMethod,
    },
  ],
  payment: [
    {
      code: 'cod_cash',
      Component: CodPaymentMethod,
    },
  ],
};
