'use client';

import { Activity, useFlow } from '@src/modules/box-builder/Stack';
import { ProductType } from '@src/modules/box-builder/components/ProductCard';
import { fallbackImageBase64 } from '@src/components/Listing/fallbackImageBase64';
import { CartLine } from '@src/components/UI/ProductCards/CartLineItem/CartLine';
import type { Entity } from '@shopana/entity';
import { useBoxBuilderQuantityInputProps } from '@src/modules/box-builder/hooks/useBoxBuilderQuantityInputProps';
import { composeProductTitle } from '@src/utils/composeProductTitle';

interface BoxCartLineProps {
  cartLine: Entity.CartLine;
}

/**
 * Cart line component for regular products with quantity controls
 */
export default function BoxCartLine({ cartLine }: BoxCartLineProps) {
  const { push } = useFlow();

  const purchasableId = cartLine.purchasable?.id ?? '';
  const imageUrl = cartLine.purchasable?.cover?.url || fallbackImageBase64;
  const title = composeProductTitle({
    productTitle: cartLine.purchasable?.product?.title,
    variantTitle: cartLine.purchasable?.title,
    fallback: cartLine.purchasable?.title || '',
  });

  const price = cartLine.cost.unitPrice;
  const quantityInputProps = useBoxBuilderQuantityInputProps({
    productId: purchasableId,
    disabled: !cartLine.cost.unitPrice.amount,
    appearance: 'card',
    confirmRemove: true,
  });

  const handleClick = () => {
    push(Activity.Product, {
      productHandle: cartLine.purchasable?.product?.handle,
      variantHandle: cartLine.purchasable?.handle,
      productType: ProductType.Product,
      opener: Activity.Cart,
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
        size: 'small',
        color: 'primary',
      }}
    />
  );
}
