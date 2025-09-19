"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { fallbackImageBase64 } from "../Listing/fallbackImageBase64";
import { ApiCartLine } from "@codegen/schema-client";
import { Price } from "../UI/Price/Price";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { useBoxBuilderStore } from "@src/store/appStore";
import { Activity, useFlow } from "./stackflow/Stack";
import { ProductCardTitle } from "@src/components/UI/ProductCards/Title/Title";
import { BoxBuilderQuantityInput } from "./ActionButton/QuantityInput";
import { ProductType } from "./ProductCard";

const { Text } = Typography;

interface BoxCartLineProps {
  product: ApiCartLine;
}

export default function BoxCartLine({ product }: BoxCartLineProps) {
  const { styles } = useStyles();
  const { push } = useFlow();

  const { selectedBoxId, selectedCardIds } = useBoxBuilderStore();

  const isItBox = product.purchasable?.id === selectedBoxId;
  const isItEnvelope = selectedCardIds.includes(product.purchasable?.id ?? "");

  const purchasable = product.purchasable ?? {};
  const imageUrl = purchasable.cover?.url ?? fallbackImageBase64;
  const title = purchasable.title ?? "";

  const price = product.cost.unitPrice;

  const handleClick = () => {
    push(Activity.Product, {
      productHandle: product.purchasable.handle,
      productType: isItBox
        ? ProductType.Box
        : isItEnvelope
        ? ProductType.Card
        : ProductType.Product,
    });
  };

  return (
    <Flex key={product.id} justify="space-between" align="center">
      <Flex align="center" gap={8} onClick={handleClick}>
        <Thumbnail src={imageUrl} alt={title} className={styles.productImage} />
        <Flex vertical className={styles.productInfo}>
          <ProductCardTitle rows={2} size="large">
            {title}
          </ProductCardTitle>
          <Text strong>
            <Price money={price} raw />
          </Text>
        </Flex>
      </Flex>
      <div className={styles.quantityInput}>
        <BoxBuilderQuantityInput
          productId={purchasable?.id ?? ""}
          size="small"
          color="primary"
          disabled={!product.cost.unitPrice.amount}
          useTrashButton
          appearance="card"
        />
      </div>
    </Flex>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    productImage: css`
      width: 64px;
      height: 64px;
    `,
    productInfo: css`
      max-width: 170px;
    `,
    quantityInput: css`
      max-width: 100px;
    `,
  };
});
