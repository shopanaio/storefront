import { Badge } from "antd";
import { calcSale } from "@src/utils/calcSale";
import { createStyles } from "antd-style";

type SaleBadgeProps = {
  compareAtPrice?: number | string;
  price: number | string;
};

export const SaleBadge: React.FC<SaleBadgeProps> = ({
  compareAtPrice,
  price,
}) => {
  const { styles } = useStyles();

  // Convert values to numbers since in Shopify they may come as strings
  const compareAtPriceNumber =
    typeof compareAtPrice === "string"
      ? parseFloat(compareAtPrice)
      : compareAtPrice;
  const priceNumber = typeof price === "string" ? parseFloat(price) : price;

  const sale = calcSale(compareAtPriceNumber, priceNumber);

  if (!compareAtPriceNumber || !sale) {
    return null;
  }

  return <Badge count={`-${sale}%`} className={styles.saleBadge} />;
};

export const useStyles = createStyles(({ css, token }) => ({
  saleBadge: css`
    .ant-badge-count {
      padding: 0 ${token.paddingXXS}px;
      color: ${token.colorErrorText};
      background-color: ${token.colorErrorBg};
    }
  `,
}));
