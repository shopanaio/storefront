import '@stackflow/plugin-basic-ui/index.css';

import { basicUIPlugin } from '@stackflow/plugin-basic-ui';
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic';
import { stackflow, StackflowOutput } from '@stackflow/react/future';
import { defineConfig } from '@stackflow/config';
import { historySyncPlugin } from '@stackflow/plugin-history-sync';

import Intro from './activities/Intro';
import Step1 from './activities/Step1';
import Step2 from './activities/Step2';
import Step3 from './activities/Step3';
import Cart from './activities/Cart';
import Product from './activities/Product';
import Checkout from './activities/Checkout';
import Order from './activities/Order';
import Category from './activities/Category';

export enum Activity {
  Intro = 'Intro',
  Step1 = 'Step1',
  Step2 = 'Step2',
  Step3 = 'Step3',
  Product = 'Product',
  Category = 'Category',
  Cart = 'Cart',
  Checkout = 'Checkout',
  Order = 'Order',
}

const config = defineConfig({
  activities: [
    {
      name: Activity.Intro,
      route: '/into',
    },
    {
      name: Activity.Step1,
      route: '/step1',
    },
    {
      name: Activity.Step2,
      route: '/step2',
    },
    {
      name: Activity.Step3,
      route: '/step3',
    },
    {
      name: Activity.Product,
      route: '/product',
    },
    {
      name: Activity.Category,
      route: '/category',
    },
    {
      name: Activity.Cart,
      route: '/cart',
    },
    {
      name: Activity.Checkout,
      route: '/checkout',
    },
    {
      name: Activity.Order,
      route: '/order',
    },
  ],

  transitionDuration: 0,
  initialActivity: () => Activity.Intro,
});

let stackflowOutput: StackflowOutput;

export const createStack = (isIOS: boolean = false) => {
  const theme = isIOS ? 'cupertino' : 'android';

  stackflowOutput = stackflow({
    config,
    components: {
      Intro,
      Step1,
      Step2,
      Step3,
      Cart,
      Product,
      Checkout,
      Order,
      Category,
    },
    plugins: [
      basicRendererPlugin(),
      basicUIPlugin({
        theme,
        appBar: {
          height: '56px',
          borderSize: '2px',
        },
      }),
      historySyncPlugin({
        config,
        fallbackActivity: () => Activity.Intro,
        useHash: true,
      }),
    ],
  });

  return stackflowOutput;
};

export const useFlow = () => {
  return stackflowOutput.actions;
};
