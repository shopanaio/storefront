import { Badge, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { ApiCartLine } from "@codegen/schema-client";
import { Price } from "../UI/Price/Price";
import { Thumbnail } from "../UI/Thumbnail/Thumbnail";

const { Text } = Typography;

interface Prop {
  product: ApiCartLine;
}

export const SummaryItem = ({ product }: Prop) => {
  const { styles } = useStyles();

  return (
    <Flex className={styles.item} align="center" justify="space-between">
      <Flex align="center" gap={16}>
        <div className={styles.imgWrapper}>
          <Badge count={product.quantity} color="blue" offset={[0, 0]}>
            <Thumbnail
              src={product.purchasable.cover?.url}
              alt={product.purchasable.title}
            />
          </Badge>
        </div>

        <Text className={styles.productName} type="secondary">
          {product.purchasable.title}
        </Text>
      </Flex>

      <Text strong>
        <Price money={product.cost.totalAmount} />
      </Text>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  item: css`
    border-radius: ${token.borderRadius}px;

    ${mq.lg} {
      padding: ${token.paddingXS}px;
      background-color: ${token.colorBgBase};
    }
  `,

  imgWrapper: css`
    width: 64px;
    height: 64px;
  `,
  productName: css`
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    white-space: normal;
    font-size: ${token.fontSize}px;
    font-weight: 500;
    width: 200px;
  `,
}));
