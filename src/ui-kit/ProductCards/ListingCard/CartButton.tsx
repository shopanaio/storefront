import { Button, ButtonProps } from 'antd';
import { TbShoppingCart, TbCheck } from 'react-icons/tb';
import { useTranslations } from 'next-intl';

export interface ProductCartButtonProps {
  isAvailable: boolean;
  showLabel?: boolean;
  className?: string;
  isInCart?: boolean;
  isLoading?: boolean;
  onAddToCart?: () => void;
  size?: ButtonProps['size'];
}

export const ProductCartButton = ({
  isAvailable,
  showLabel,
  className,
  isInCart,
  isLoading = false,
  onAddToCart,
  size,
}: ProductCartButtonProps) => {
  const t = useTranslations('Product');

  return (
    <Button
      className={className}
      size={size}
      color="primary"
      variant={isInCart ? 'outlined' : 'solid'}
      disabled={!isAvailable}
      loading={isLoading}
      icon={
        !isLoading &&
        (isInCart ? (
          <TbCheck color={!isAvailable ? 'secondary' : 'default'} size={18} />
        ) : (
          <TbShoppingCart
            color={!isAvailable ? 'secondary' : 'default'}
            size={18}
          />
        ))
      }
      onClick={isInCart ? undefined : onAddToCart}
      // eslint-disable-next-line react/no-children-prop
      children={showLabel && (isInCart ? t('in-cart') : t('add-to-cart'))}
    />
  );
};
