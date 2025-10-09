"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LayoutFooterButton } from "@src/modules/box-builder/components/Layout";
import { useBoxBuilderProgress } from "@src/modules/box-builder/hooks/useCartProgress";
import { Activity, useFlow } from "@src/modules/box-builder/Stack";

interface ProductsOnlyFooterButtonProps {
  onClickOverride?: () => void;
}

const ProductsOnlyFooterButton: React.FC<ProductsOnlyFooterButtonProps> = ({
  onClickOverride,
}) => {
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();
  const {  products } = useBoxBuilderProgress();

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
