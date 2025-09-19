import { WarehouseMethod } from "./WarehouseMethod";
import { AddressMethod } from "./AddressMethod";
import { IMAGES } from "./postsLogos";



export const shippingMethodComponents: Record<
  string,
  {
    Component: React.FC<any>;
    icon: string;
  }
> = {
  "nova-poshta-warehouse": {
    Component: WarehouseMethod,
    icon: IMAGES.NOVA_POSHTA_LOGO,
  },
  "nova-poshta-address": {
    Component: AddressMethod,
    icon: IMAGES.NOVA_POSHTA_LOGO,
  },
  "meest-express-address": {
    Component: AddressMethod,
    icon: IMAGES.MEEST_LOGO,
  },
};
