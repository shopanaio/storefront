"use client";

import { useBoxBuilderStore } from "@src/store/appStore";
import { Activity, useFlow } from "@src/modules/box-builder/stackflow/Stack";
import { ProductType } from "@src/modules/box-builder/components/ProductCard";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
import { CartLine } from "@src/components/UI/ProductCards/CartLineItem/CartLine";
import { Entity } from "@src/entity";
import { useBoxBuilderQuantityInputProps } from "@src/modules/box-builder/hooks/useBoxBuilderQuantityInputProps";

interface BoxCartLineProps {
  cartLine: Entity.CartLine;
}

export default function BoxCartLine({ cartLine }: BoxCartLineProps) {
  const { push } = useFlow();
  const { boxProductIds, cardProductIds } = useBoxBuilderStore();

  const purchasableId = cartLine.purchasable?.id ?? "";
  const imageUrl = cartLine.purchasable?.cover?.url || fallbackImageBase64;
  const title = cartLine.purchasable?.title || "";
  const price = cartLine.cost.unitPrice;

  const quantityInputProps = useBoxBuilderQuantityInputProps({
    productId: purchasableId,
    disabled: !cartLine.cost.unitPrice.amount,
    appearance: "card",
  });

  const handleClick = () => {
    const isProductTypeBox = boxProductIds.includes(purchasableId);
    const isProductTypeEnvelope = cardProductIds.includes(purchasableId);

    push(Activity.Product, {
      productHandle: cartLine.purchasable?.handle,
      productType: isProductTypeBox
        ? ProductType.Box
        : isProductTypeEnvelope
        ? ProductType.Card
        : ProductType.Product,
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
      onRemove={quantityInputProps.onRemove}
      quantityInputProps={{
        ...quantityInputProps,
        size: "small",
        color: "primary",
      }}
    />
  );
}
