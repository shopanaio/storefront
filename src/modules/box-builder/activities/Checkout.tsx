'use client';

import { useCallback } from 'react';
import { Checkout as CheckoutComponent } from '@src/modules/checkout';
import { ActivityComponentType } from '@stackflow/react';
import Layout from '@src/modules/box-builder/stackflow/Layout';
import { Activity, useFlow } from '../stackflow/Stack';
import useCartId from '@src/hooks/cart/useCartId';
import { useBoxBuilderCartCleanup } from '@src/modules/box-builder/hooks/useBoxBuilderCartCleanup';

const Checkout: ActivityComponentType = () => {
  const { push } = useFlow();
  const { cartId } = useCartId();
  const cleanup = useBoxBuilderCartCleanup();

  const handleConfirm = useCallback(() => {
    cleanup(cartId);
    push(Activity.Order, {});
  }, [cleanup, cartId, push]);

  return (
    <Layout showCart={false} paddingTop={false} paddingBottom={false}>
      <CheckoutComponent
        cartId={cartId}
        onConfirm={handleConfirm}
        features={{ auth: false }}
      />
    </Layout>
  );
};

export default Checkout;
