"use client";

import { Activity, useFlow } from "@src/modules/box-builder/Stack";
import { ProductType } from "@src/modules/box-builder/components/ProductCard";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
import { CartLine } from "@src/components/UI/ProductCards/CartLineItem/CartLine";
import type { Entity } from "@shopana/entity";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import { composeProductTitle } from "@src/utils/composeProductTitle";

interface SpecialBoxCartLineProps {
  cartLine: Entity.CartLine;
  productType: ProductType.Box | ProductType.Card;
}

/**
 * Cart line component for special products (boxes and cards) with change button
 */
export default function SpecialBoxCartLine({
  cartLine,
  productType,
}: SpecialBoxCartLineProps) {
  const { push } = useFlow();
  const t = useTranslations("BoxBuilder");

  const imageUrl = cartLine.purchasable?.cover?.url || fallbackImageBase64;
  const title = composeProductTitle({
    productTitle: cartLine.purchasable?.product?.title,
    variantTitle: cartLine.purchasable?.title,
    fallback: cartLine.purchasable?.title || "",
  });
  const price = cartLine.cost.unitPrice;

  const handleClick = () => {
    push(Activity.Product, {
      productHandle: cartLine.purchasable?.handle,
      variantHandle: cartLine.purchasable?.product?.handle,
      productType,
    });
  };

  return (
    <CartLine
      id={cartLine.id}
      title={title}
      imageUrl={imageUrl}
      quantity={cartLine.quantity}
      unitPrice={price}
      variant="drawer"
      onClick={handleClick}
      rightNode={
        <Button type="link" onClick={handleClick}>
          {t("change")}
        </Button>
      }
    />
  );
}
