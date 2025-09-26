import { CardPaymentMethod } from "./CardPaymentMethod";
import { CachePaymentMethod } from "./CachePaymentMethod";



export const paymentMethodsMap: Record<
  string,
  {
    Component: React.FC<any>;
    icon: string;
  }
> = {
  "card": {
    Component: CardPaymentMethod,
    icon: "https://1000logos.net/wp-content/uploads/2017/06/VISA-Logo-2006.png",
  },
  "cache": {
    Component: CachePaymentMethod,
    icon: "https://1000logos.net/wp-content/uploads/2017/06/VISA-Logo-2006.png",
  },
};
