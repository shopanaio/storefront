import React from "react";
import { Image, Flex, Typography, Button } from "antd";
import { createStyles, cx } from "antd-style";
import { TbTrash } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import { Price } from "@src/components/UI/Price/Price";
import { SaleBadge } from "@src/components/UI/Badges/Sale";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
import { QuantityInput } from "@src/components/Product/QuantityInput";
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
  quantity: number;
  unitPrice: Entity.Money;
  compareAtUnitPrice?: Entity.Money | null;

  // Settings display
  variant?: "drawer" | "page";

  // Handlers events
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onClick: () => void;

  // Optional right-side custom content (e.g., custom QuantityInput)
  rightNode?: React.ReactNode;
}

export const CartLine = ({
  id,
  title,
  imageUrl,
  quantity,
  unitPrice,
  compareAtUnitPrice,
  variant = DEFAULT_VARIANT,
  onIncrement,
  onDecrement,
  onRemove,
  onClick,
  rightNode,
}: CartLineProps) => {
  const { styles } = useStyles();

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
              <Money money={unitPrice} />
            </Typography.Text>
          </Flex>
        </Flex>
        <div className={styles.simpleQuantityInput}>
          {rightNode ? (
            rightNode
          ) : (
            <QuantityInput
              value={quantity}
              color="primary"
              onIncrement={onIncrement!}
              onDecrement={onDecrement!}
              onRemove={onRemove}
              size="small"
            />
          )}
        </div>
      </Flex>
    );
  }

  return (
    <Flex
      key={id}
      className={cx(styles.productCard, { page: variant === "page" })}
      onClick={onClick}
    >
      <div className={cx(styles.imageWrapper, { page: variant === "page" })}>
        <Image
          src={imageUrl}
          alt={title}
          fallback={fallbackImageBase64}
          preview={false}
        />
      </div>

      <Flex
        className={cx(styles.nameAndFeatures, { page: variant === "page" })}
        vertical
      >
        <Text className={styles.productName}>{title}</Text>
      </Flex>

      <Button
        className={cx(styles.deleteBtn, { page: variant === "page" })}
        type="text"
        size="large"
        icon={<TbTrash size={18} />}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />

      <QuantityInput
        value={quantity}
        color="primary"
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        size="large"
        className={cx(styles.qntWrapper, { page: variant === "page" })}
      />

      <Flex
        className={cx(styles.productPriceBox, { page: variant === "page" })}
        vertical
        align="flex-end"
      >
        {compareAtUnitPrice && (
          <Flex align="center" gap={8}>
            <Text delete type="secondary" className={styles.productOldPrice}>
              <Price money={compareAtUnitPrice} />
            </Text>
            <SaleBadge
              compareAtPrice={compareAtUnitPrice.amount}
              price={unitPrice.amount}
            />
          </Flex>
        )}
        <Text
          className={cx(styles.productNewPrice, { page: variant === "page" })}
          strong
        >
          <Price money={unitPrice} />
        </Text>
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  // Simple drawer layout styles
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
    display: grid;

    grid-template-columns: 64px 1fr 40px;
    grid-template-rows: auto auto;

    gap: ${token.margin}px;

    padding: ${token.margin}px;

    background: transparent;

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
    grid-row: 1;
    grid-column: 1;

    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    background-color: transparent;

    width: 64px;
    height: 64px;
    flex-shrink: 0;
  `,

  nameAndFeatures: css`
    grid-row: 1;
    grid-column: 2;

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

    width: 130px;
    /* height: 40px; */

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
