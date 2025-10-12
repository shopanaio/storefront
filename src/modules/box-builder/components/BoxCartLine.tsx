"use client";

import { useBoxBuilderStore } from "@src/store/appStore";
import { Activity, useFlow } from "@src/modules/box-builder/Stack";
import { ProductType } from "@src/modules/box-builder/components/ProductCard";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
import { CartLine } from "@src/components/UI/ProductCards/CartLineItem/CartLine";
import type { Entity } from "@shopana/entity";
import { useBoxBuilderQuantityInputProps } from "@src/modules/box-builder/hooks/useBoxBuilderQuantityInputProps";
import { createStyles } from "antd-style";

interface BoxCartLineProps {
  cartLine: Entity.CartLine;
}

export default function BoxCartLine({ cartLine }: BoxCartLineProps) {
  const { push } = useFlow();
  const { boxProductIds, cardProductIds } = useBoxBuilderStore();
  const { styles } = useStyles();

  const purchasableId = cartLine.purchasable?.id ?? "";
  const imageUrl = cartLine.purchasable?.cover?.url || fallbackImageBase64;
  const title = cartLine.purchasable?.title || "";
  const price = cartLine.cost.unitPrice;

  const isBox = boxProductIds.includes(purchasableId);
  const quantityInputProps = isBox
    ? undefined
    : useBoxBuilderQuantityInputProps({
        productId: purchasableId,
        disabled: !cartLine.cost.unitPrice.amount,
        appearance: "card",
        confirmRemove: true,
      });

  const handleClick = () => {
    const isProductTypeBox = boxProductIds.includes(purchasableId);
    const isProductTypeEnvelope = cardProductIds.includes(purchasableId);

    push(Activity.Product, {
      productHandle: cartLine.purchasable?.handle,
      variantHandle: cartLine.purchasable?.product?.handle,
      productType: isProductTypeBox
        ? ProductType.Box
        : isProductTypeEnvelope
        ? ProductType.Card
        : ProductType.Product,
    });
  };

  return (
    <div className={isBox ? styles.boxWrapper : undefined}>
      <CartLine
        id={cartLine.id}
        title={title}
        imageUrl={imageUrl}
        quantity={cartLine.quantity}
        unitPrice={price}
        variant="drawer"
        onClick={handleClick}
        onRemove={quantityInputProps?.onRemove}
        quantityInputProps={
          quantityInputProps
            ? {
                ...quantityInputProps,
                size: "small",
                color: "primary",
              }
            : undefined
        }
      />
    </div>
  );
}

const useStyles = createStyles(({ token, css }) => ({
  boxWrapper: css`
    border: 1px solid ${token.colorPrimary};
    border-radius: ${token.borderRadius}px;
    padding: ${token.paddingXS}px;
  `,
}));
