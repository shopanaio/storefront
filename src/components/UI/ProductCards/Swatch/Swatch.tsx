"use client";

import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import { useRoutes } from "@src/hooks/useRoutes";
import { Flex, Button, Typography } from "antd";
import { createStyles } from "antd-style";

const { Text } = Typography;

export interface ProductCardSwatchesProps {
  swatches: UiOptionValue[];
  max?: number;
}

export const ProductCardSwatches = ({
  swatches,
  max = 5,
}: ProductCardSwatchesProps) => {
  const { styles } = useStyles();
  const routes = useRoutes();

  const visibleItemsQty = swatches?.slice(0, max);
  const restItemsQty = swatches?.length - max;

  return (
    <Flex gap={8} align="center">
      {visibleItemsQty?.map((option, index) => (
        <Button
          key={index}
          color={option.isActive ? "primary" : "default"}
          className={styles.colorBtn}
          href={
            option.variant
              ? routes.product.path(
                  // product handle should be available on parent product in context; fallback to variant handle if missing
                  (option as any)?.product?.handle || option.variant?.handle,
                  { variant: option.variant?.handle }
                )
              : undefined
          }
          variant="outlined"
        >
          <div
            className={styles.colorCircleInner}
            style={{ backgroundColor: option.swatch?.color || "#fff" }}
          />
        </Button>
      ))}
      {restItemsQty > 0 && (
        <Text className={styles.restItemsQty}>+{restItemsQty}</Text>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  colorBtn: css`
    width: ${token.sizeMD}px;
    height: ${token.sizeMD}px;
    border-radius: 50%;
    border: 1px solid ${token.colorBorder};
    padding: 2px;

    &:hover {
      border: 1px solid ${token.colorPrimary};
    }
  `,

  colorCircleInner: css`
    border-radius: 50%;
    border: 0px;
    height: 100%;
    width: 100%;
  `,

  restItemsQty: css`
    line-height: 1;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `,
}));
