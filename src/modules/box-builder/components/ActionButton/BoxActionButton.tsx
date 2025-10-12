'use client';
import { Activity, useFlow } from '@src/modules/box-builder/Stack';
import { Button, ButtonProps } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAddItemToBoxBuilderCart } from '@src/modules/box-builder/hooks/useAddItemToCart';
import { useBoxBuilderStore } from '@src/store/appStore';
import { BoxBuilderQuantityInputProps } from '@src/modules/box-builder/components/ActionButton/QuantityInput';
import { LayoutFooterButton } from '@src/modules/box-builder/components/Layout';
import { Entity } from '@shopana/entity';
import { useIsInTheBoxBuilderCart } from '@src/modules/box-builder/hooks/useIsInTheCart';
import { useReplaceBoxBuilderCartItem } from '@src/modules/box-builder/hooks/useReplaceCartItem';
import { useBoxBuilderProducts } from '@src/modules/box-builder/hooks/useBoxProducts';

export interface BoxActionButtonProps {
  variant: Entity.ProductVariant;
  loading?: boolean;
  buttonProps?: ButtonProps;
  quantityProps?: Partial<BoxBuilderQuantityInputProps>;
  appearance: 'card' | 'activity';
  onNavigate: () => void;
}

export const BoxActionButton = ({
  variant,
  loading: loadingProp,
  buttonProps,
  appearance,
  onNavigate,
}: BoxActionButtonProps) => {
  const t = useTranslations('BoxBuilder');

  const { addToCart, loading: isAdding } = useAddItemToBoxBuilderCart();
  const { replaceCartItem, loading: isReplacing } =
    useReplaceBoxBuilderCartItem();
  const { addBoxProductId } = useBoxBuilderStore();
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  const { boxes } = useBoxBuilderProducts();
  const firstSelectedBox = boxes[0]; // Get the first selected box if exists

  const cartLine = useIsInTheBoxBuilderCart(variant.id);
  const isInCart = Boolean(cartLine);

  const isAvailable = variant.stockStatus?.isAvailable === true;
  const loading = loadingProp || isInternalLoading || isAdding || isReplacing;

  if (!isAvailable) {
    return (
      <Button disabled block {...buttonProps}>
        {t('sold-out')}
      </Button>
    );
  }

  const handleSelect = async () => {
    if (isInternalLoading) return;
    setIsInternalLoading(true);

    try {
      // If there's an existing selected box and it's not the current variant
      if (firstSelectedBox) {
        if (firstSelectedBox.purchasableId === variant.id) {
          console.log('firstSelectedBox.purchasableId === variant.id');
          return;
        }

        // Replace the existing box with the new one
        await replaceCartItem({
          quantity: 1,
          lineId: firstSelectedBox.id,
          purchasableId: variant.id,
        });
      } else {
        // No box selected yet, add new one
        await addToCart({
          purchasableId: variant.id,
          quantity: 1,
        });
      }

      if (appearance === 'activity') {
        onNavigate();
      }
      addBoxProductId(variant.id);
      // If current variant is already selected, do nothing (will proceed to next step)
    } finally {
      setIsInternalLoading(false);
    }
  };

  if (appearance === 'activity') {
    if (isInCart) {
      return (
        <LayoutFooterButton
          label={variant.title}
          money={variant.price}
          onClick={onNavigate}
          loading={loading}
        />
      );
    }

    return (
      <Button
        block
        {...buttonProps}
        color="primary"
        variant="solid"
        onClick={handleSelect}
        loading={loading}
      >
        {t('select-design')}
      </Button>
    );
  }

  if (isInCart) {
    return (
      <Button
        block
        onClick={onNavigate}
        type="primary"
        loading={loading}
        {...buttonProps}
      >
        {t('next')}
      </Button>
    );
  }

  return (
    <Button
      block
      onClick={handleSelect}
      type="default"
      loading={loading}
      {...buttonProps}
    >
      {t('select')}
    </Button>
  );
};
