import React from "react";
import { Image, Flex, Typography, Button } from "antd";
import { createStyles, cx } from "antd-style";
import { TbTrash } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { Price } from "@src/components/UI/Price/Price";
import { SaleBadge } from "@src/components/UI/Badges/Sale";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
import {
  QuantityInput,
  QuantityInputProps,
} from "@src/components/Product/QuantityInput";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { ProductCardTitle } from "@src/components/UI/ProductCards/Title/Title";
import { Entity } from "@src/entity";
import { Money } from "@src/components/UI/Price/Money";

const { Text } = Typography;

// Constants for default values
const DEFAULT_VARIANT = "drawer" as const;

export interface CartLineProps {
  // Main product data
  id: string;
  title: string;
  imageUrl: string;

  // Quantity and prices
  quantity: number | string;
  unitPrice: Entity.Money;
  compareAtUnitPrice?: Entity.Money | null;
  totalPrice?: Entity.Money; // Total price for the item (unitPrice * quantity), optional if calculated internally
  totalDiscount?: Entity.Money | null;

  // Settings display
  variant?: "drawer" | "page";

  // Click handler
  onClick?: () => void;

  // Remove handler for delete button
  onRemove?: () => void;

  // Optional QuantityInput props - если переданы, то QuantityInput рендерится с этими пропсами
  quantityInputProps?: QuantityInputProps;

  // Optional right-side custom content (e.g., custom QuantityInput)
  rightNode?: React.ReactNode;
}

export const CartLine = ({
  id,
  title,
  imageUrl,
  quantity,
  unitPrice,
  totalPrice,
  // totalDiscount,
  variant = DEFAULT_VARIANT,
  onClick,
  onRemove,
  quantityInputProps,
  rightNode,
}: CartLineProps) => {
  const { styles } = useStyles();

  // Calculate total price if not provided
  const computedTotalPrice: Entity.Money = totalPrice || {
    amount: (
      parseFloat(unitPrice.amount) *
      (typeof quantity === "number" ? quantity : parseInt(quantity.toString()))
    ).toString(),
    currencyCode: unitPrice.currencyCode,
  };

  // Drawer layout: match box-builder's simple line design
  if (variant === "drawer") {
    return (
      <Flex key={id} justify="space-between" align="center">
        <Flex align="center" gap={8} onClick={onClick}>
          <Thumbnail
            src={imageUrl || fallbackImageBase64}
            alt={title}
            className={styles.simpleProductImage}
          />
          <Flex vertical className={styles.simpleProductInfo}>
            <ProductCardTitle rows={2} size="large">
              {title}
            </ProductCardTitle>
            <Typography.Text strong>
              <Money money={computedTotalPrice} />
            </Typography.Text>
          </Flex>
        </Flex>
        {quantityInputProps ? (
          <div className={styles.simpleQuantityInput}>
            <QuantityInput {...quantityInputProps} />
          </div>
        ) : rightNode ? (
          rightNode
        ) : null}
      </Flex>
    );
  }

  return (
    <Flex key={id} className={cx(styles.productCard, "page")} onClick={onClick}>
      <div className={cx(styles.imageWrapper, "page")}>
        <Image
          src={imageUrl}
          alt={title}
          fallback={fallbackImageBase64}
          preview={false}
        />
      </div>
      <Flex className={cx(styles.nameAndFeatures, "page")} vertical>
        <Text className={styles.productName}>{title}</Text>
      </Flex>
      {onRemove && (
        <Button
          className={cx(styles.deleteBtn, "page")}
          type="text"
          size="large"
          icon={<TbTrash size={18} />}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
      {quantityInputProps && (
        <QuantityInput
          {...quantityInputProps}
          color="default"
          className={cx(
            styles.qntWrapper,
            "page",
            quantityInputProps.className
          )}
        />
      )}

      <Flex
        className={cx(styles.productPriceBox, "page")}
        vertical
        align="flex-end"
      >
        <Text className={cx(styles.productNewPrice, "page")} strong>
          <Price money={computedTotalPrice} />
        </Text>
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  simpleProductImage: css`
    width: 64px;
    height: 64px;
  `,
  simpleProductInfo: css`
    max-width: 170px;
  `,
  simpleQuantityInput: css`
    max-width: 100px;
  `,
  productCard: css`
    background: transparent;
    display: grid;
    gap: ${token.margin}px;
    grid-template-columns: 64px 1fr 40px;
    grid-template-rows: auto auto;
    padding: ${token.margin}px;
    &.page {
      ${mq.lg} {
        gap: 0;
        align-items: center;
        grid-template-columns: 64px 2fr 1fr 1fr 40px /* repeat(5, 1fr) */;
        grid-template-rows: auto;
      }
    }
  `,
  imageWrapper: css`
    background-color: transparent;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorderSecondary};
    flex-shrink: 0;
    grid-column: 1;
    grid-row: 1;
    height: 64px;
    overflow: hidden;
    width: 64px;
  `,
  nameAndFeatures: css`
    grid-column: 2;
    grid-row: 1;
    &.page {
      ${mq.lg} {
        max-width: 340px;
        grid-column: 2;
        gap: ${token.marginSM}px;
        align-self: start;
        padding-left: ${token.paddingLG}px;
      }
    }
  `,
  productName: css`
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    white-space: normal;
    font-size: ${token.fontSize}px;
    font-weight: 500;
  `,
  deleteBtn: css`
    grid-row: 1;
    grid-column: 3;
    &.page {
      ${mq.lg} {
        grid-column: 5;
      }
    }
  `,
  qntWrapper: css`
    grid-row: 2;
    grid-column: 1 / span 2;
    max-width: 100px;
    &.page {
      ${mq.lg} {
        grid-row: 1;
        grid-column: 3;
        justify-self: start;
      }
    }
  `,
  productPriceBox: css`
    grid-row: 2;
    grid-column: 2 / span 2;
    &.page {
      ${mq.lg} {
        grid-row: 1;
        grid-column: 4;
        align-items: flex-start;
      }
    }
  `,
  productOldPrice: css`
    font-size: ${token.fontSize}px;
    line-height: 1;
  `,
  productNewPrice: css`
    font-size: ${token.fontSizeLG}px;
    line-height: 1;
    &.page {
      ${mq.lg} {
        font-size: 18px;
      }
    }
  `,
}));
