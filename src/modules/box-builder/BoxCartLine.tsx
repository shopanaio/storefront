"use client";

import { ApiCheckoutLine } from "@codegen/schema-client";
import { useBoxBuilderStore } from "@src/store/appStore";
import { Activity, useFlow } from "./stackflow/Stack";
import { BoxBuilderQuantityInput } from "./ActionButton/QuantityInput";
import { ProductType } from "./ProductCard";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
import { CartLine } from "@src/components/UI/ProductCards/CartLineItem/CartLine";

interface BoxCartLineProps {
  product: ApiCheckoutLine;
}

export default function BoxCartLine({ product }: BoxCartLineProps) {
  const { push } = useFlow();

  const { selectedBoxId, selectedCardIds } = useBoxBuilderStore();

  const isItBox = product.purchasableId === selectedBoxId;
  const isItEnvelope = selectedCardIds.includes(product.purchasableId ?? "");

  const purchasable = (product as any).purchasable ?? {};
  const imageUrl =
    purchasable.cover?.url || product.imageSrc || fallbackImageBase64;
  const title = purchasable.title || product.title || "";

  const price = product.cost.unitPrice;

  const handleClick = () => {
    push(Activity.Product, {
      productHandle: purchasable.handle,
      productType: isItBox
        ? ProductType.Box
        : isItEnvelope
        ? ProductType.Card
        : ProductType.Product,
    });
  };

  return (
    <CartLine
      id={product.id ?? purchasable?.id ?? ""}
      title={title}
      imageUrl={imageUrl}
      quantity={(product as any)?.quantity ?? 0}
      unitPrice={price as any}
      variant="drawer"
      onClick={handleClick}
      rightNode={
        <BoxBuilderQuantityInput
          productId={purchasable?.id ?? ""}
          size="small"
          color="primary"
          disabled={!product.cost.unitPrice.amount}
          useTrashButton
          appearance="card"
        />
      }
    />
  );
}
