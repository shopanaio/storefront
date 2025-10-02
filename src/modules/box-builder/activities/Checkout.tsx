"use client";

import { Checkout as CheckoutComponent } from "@src/modules/checkout";
import { ActivityComponentType } from "@stackflow/react";
import Layout from "@src/modules/box-builder/stackflow/Layout";
import { useBoxBuilderCart } from "@src/modules/box-builder/hooks/useCart";
import { Activity, useFlow } from "../stackflow/Stack";

const Checkout: ActivityComponentType = () => {
  const { push } = useFlow();
  const { cart } = useBoxBuilderCart();

  const handleConfirm = () => {
    push(Activity.Order, {});
  };

  return (
    <Layout showCart={false} paddingTop={false}>
      <CheckoutComponent
        cart={cart}
        onConfirm={handleConfirm}
        features={{ auth: false }}
      />
    </Layout>
  );
};

export default Checkout;
