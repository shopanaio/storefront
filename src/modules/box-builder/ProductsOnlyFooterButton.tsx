"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LayoutFooterButton } from "./stackflow/Layout";
import type { ApiMoney } from "@codegen/schema-client";
import { useCart } from "@src/modules/box-builder/hooks/useCart";
import { useCartProgress } from "@src/modules/box-builder/hooks/useCartProgress";
import { Activity, useFlow } from "@src/modules/box-builder/stackflow/Stack";

interface ProductsOnlyFooterButtonProps {
  onClickOverride?: () => void;
}

const ProductsOnlyFooterButton: React.FC<ProductsOnlyFooterButtonProps> = ({
  onClickOverride,
}) => {
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();
  const { cart } = useCart();
  const {
    productsOnlyCount,
    selectedBoxInCart,
    boxQuantityInCart,
    envelopesTotalPriceAmount,
  } = useCartProgress();

  if (productsOnlyCount <= 0) return null;

  const boxPrice = (selectedBoxInCart?.price?.amount ?? 0) * boxQuantityInCart;
  const envelopePrice = envelopesTotalPriceAmount;
  const productsOnlyPrice =
    (cart?.cost.totalAmount.amount ?? 0) - boxPrice - envelopePrice;

  const baseMoney = cart?.cost?.totalAmount;
  const productsOnlyCost: ApiMoney | undefined = baseMoney
    ? {
        amount: Math.max(0, productsOnlyPrice),
        currencyCode: baseMoney.currencyCode as ApiMoney["currencyCode"],
      }
    : undefined;

  const handleClick = onClickOverride ?? (() => push(Activity.Step3, {}));

  return (
    <LayoutFooterButton
      onClick={handleClick}
      label={t("footer.products-count", { count: productsOnlyCount })}
      money={productsOnlyCost}
      size="large"
    />
  );
};

export default ProductsOnlyFooterButton;
