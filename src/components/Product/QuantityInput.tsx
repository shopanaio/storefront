'use client';

import { Button, ButtonProps, Input } from 'antd';
import { TbMinus, TbPlus, TbTrash } from 'react-icons/tb';
import { createStyles, cx } from 'antd-style';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { useRef } from 'react';

export interface QuantityInputProps {
  value: number | string;
  color?: 'primary' | 'default';
  size?: ButtonProps['size'];
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  loading?: boolean;
}

const sizes = ['small', 'middle', 'large'] as SizeType[];
const getSmallerSize = (size: ButtonProps['size']) => {
  const index = sizes.indexOf(size);
  return sizes[index - 1] || 'small';
};
const iconSize = {
  small: 16,
  middle: 18,
  large: 18,
};

export const QuantityInput = ({
  value,
  size = 'middle',
  color = 'default',
  onIncrement,
  onDecrement,
  onRemove,
  className,
  disabled = false,
  loading = false,
  style,
}: QuantityInputProps) => {
  const { styles, theme } = useStyles({ size, color });
  const prevAction = useRef<'inc' | 'dec' | null>(null);
  const buttonSize = getSmallerSize(size);

  const numericValue =
    typeof value === 'number' ? value : parseInt(String(value), 10);
  const showTrash = numericValue === 1 && onRemove;
  const DecrementIcon = showTrash ? TbTrash : TbMinus;

  const handleIncrement = () => {
    prevAction.current = 'inc';
    onIncrement();
  };

  const handleDecrement = () => {
    prevAction.current = 'dec';
    showTrash ? onRemove() : onDecrement();
  };

  return (
    <Input
      style={style}
      styles={{
        affixWrapper:
          color === 'primary'
            ? {
                backgroundColor: theme.colorPrimary,
                color: theme.colorPrimaryBg,
              }
            : {},
        input: {
          textAlign: 'center',
          color: color === 'primary' ? theme.colorWhite : theme.colorTextBase,
        },
      }}
      className={cx(className, styles.container)}
      value={value}
      size={size}
      readOnly
      prefix={
        <Button
          variant={color === 'default' ? 'text' : 'solid'}
          color={color}
          size={buttonSize}
          icon={<DecrementIcon size={iconSize[buttonSize]} />}
          onClick={handleDecrement}
          disabled={disabled}
          loading={loading && prevAction.current === 'dec'}
        />
      }
      suffix={
        <Button
          size={buttonSize}
          icon={<TbPlus size={iconSize[buttonSize]} />}
          variant={color === 'default' ? 'text' : 'solid'}
          color={color}
          onClick={handleIncrement}
          disabled={disabled}
          loading={loading && prevAction.current === 'inc'}
        />
      }
    />
  );
};

const useStyles = createStyles(
  (
    { css, token },
    { size, color }: { size: ButtonProps['size']; color: 'primary' | 'default' }
  ) => {
    const borderRadius =
      size === 'large' ? token.borderRadiusLG : token.borderRadius;

    return {
      container: css`
        padding: 3px;
        border-radius: ${borderRadius}px;
        border-color: ${color === 'primary' ? token.colorPrimary : undefined};
      `,
    };
  }
);
