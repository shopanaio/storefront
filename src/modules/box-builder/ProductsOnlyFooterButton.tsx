"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LayoutFooterButton } from "./stackflow/Layout";
import type { ApiMoney } from "@codegen/schema-client";
import { useBoxBuilderCart } from "@src/modules/box-builder/hooks/useCart";
import { useBoxBuilderProgress } from "@src/modules/box-builder/hooks/useCartProgress";
import { Activity, useFlow } from "@src/modules/box-builder/stackflow/Stack";

interface ProductsOnlyFooterButtonProps {
  onClickOverride?: () => void;
}

const ProductsOnlyFooterButton: React.FC<ProductsOnlyFooterButtonProps> = ({
  onClickOverride,
}) => {
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();
  const { cart } = useBoxBuilderCart();
  const { boxes, cards, products } = useBoxBuilderProgress();

  if (!products.quantity) {
    return null;
  }

  const handleClick = onClickOverride ?? (() => push(Activity.Step3, {}));

  return (
    <LayoutFooterButton
      onClick={handleClick}
      label={t("footer.products-count", { count: products.quantity })}
      money={products.totalAmount}
      size="large"
    />
  );
};

export default ProductsOnlyFooterButton;
