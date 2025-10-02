import type { FC } from 'react';
import { NPLogo as LogoComponent } from './Logo';
import { AddressForm } from './forms/AddressForm';
import { WarehouseForm } from './forms/WarehouseForm';

/**
 * Nova Poshta provider configuration: shipping and payment options
 */
export interface ProviderOptionConfig {
  /** Unique code identifier used internally */
  code: string;
  /** i18n translation key for name */
  nameI18n: string;
  /** i18n translation key for description */
  descriptionI18n?: string;
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
      code: 'warehouse_warehouse',
      nameI18n: 'shipping.warehouse',
      descriptionI18n: 'shipping.warehouse_description',
      Component: WarehouseForm,
    },
    {
      code: 'warehouse_doors',
      nameI18n: 'shipping.courier',
      descriptionI18n: 'shipping.courier_description',
      Component: AddressForm,
    },
  ],
  payment: [
    {
      code: 'cod_cash',
      nameI18n: 'payment.cod',
      descriptionI18n: 'payment.cod_description',
      Component: null,
    },
  ],
};
