import {
  ProviderModuleApi,
  ProviderModuleType,
} from '@src/modules/checkout/vendors/types';
import { NPProvider } from './components/Provider';
import { NPLogo as LogoComponent } from './components/Logo';
import { WarehouseShippingMethod } from './components/methods/WarehouseShippingMethod';
import { CourierShippingMethod } from './components/methods/CourierShippingMethod';
import { addressSchema, warehouseSchema } from './schemas';

const shippingProviderModule: ProviderModuleApi = {
  provider: 'novaposhta',
  moduleType: ProviderModuleType.Delivery,
  Component: NPProvider,
  config: {
    logo: LogoComponent,
    methods: [
      {
        code: 'warehouse_warehouse',
        schema: warehouseSchema,
        Component: WarehouseShippingMethod,
      },
      {
        code: 'warehouse_doors',
        schema: addressSchema,
        Component: CourierShippingMethod,
      },
    ],
  },
};

export default shippingProviderModule;
