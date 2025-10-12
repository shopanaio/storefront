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

export interface BoxActionButtonProps {
  variant: Entity.ProductVariant;
  loading?: boolean;
  buttonProps?: ButtonProps;
  quantityProps?: Partial<BoxBuilderQuantityInputProps>;
  appearance: 'card' | 'activity';
}

export const BoxActionButton = ({
  variant,
  loading,
  buttonProps,
  appearance,
}: BoxActionButtonProps) => {
  const t = useTranslations('BoxBuilder');
  const { push } = useFlow();

  const { addToCart, loading: isAdding } = useAddItemToBoxBuilderCart();
  const { addBoxProductId } = useBoxBuilderStore();
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  const cartLine = useIsInTheBoxBuilderCart(variant.id);
  const isInCart = Boolean(cartLine);
  const { quantity = 0 } = cartLine || {};

  const isAvailable = variant.stockStatus?.isAvailable === true;

  if (!isAvailable) {
    return (
      <Button disabled block {...buttonProps}>
        {t('sold-out')}
      </Button>
    );
  }

  const handleNext = () => {
    push(Activity.Step2, {});
  };

  const handleSelect = async () => {
    if (isInternalLoading) return;
    setIsInternalLoading(true);
    try {
      await addToCart({
        purchasableId: variant.id,
        quantity: 1,
      });
      addBoxProductId(variant.id);
    } finally {
      setIsInternalLoading(false);
    }
  };

  if (appearance === 'activity') {
    if (isInCart && quantity > 0) {
      return (
        <LayoutFooterButton
          label={variant.title}
          money={variant.price}
          onClick={handleNext}
          loading={loading || isInternalLoading || isAdding}
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
      >
        {t('select-design')}
      </Button>
    );
  }

  if (isInCart && quantity > 0) {
    return (
      <Button
        block
        onClick={handleNext}
        type="primary"
        loading={loading || isInternalLoading || isAdding}
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
      loading={loading || isInternalLoading || isAdding}
      {...buttonProps}
    >
      {t('select')}
    </Button>
  );
};
