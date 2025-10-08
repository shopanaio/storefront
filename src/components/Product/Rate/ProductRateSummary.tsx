import { Button, Flex, Progress, Rate, Typography } from "antd";
import { createStyles } from "antd-style";
import { TbStarFilled } from "react-icons/tb";
import { mq } from "@src/components/Theme/breakpoints";
import type * as Entity from "@src/entity/namespace";
import { useTranslations } from "next-intl";
import { useReviewStore } from "@src/store/appStore";

const { Text } = Typography;

interface Props {
  product: Entity.Product;
}

export const ProductRateSummary = ({ product }: Props) => {
  const t = useTranslations("Product");
  const { styles } = useStyles();

  const setReviewProduct = useReviewStore((state) => state.setReviewProduct);

  const productRating = product.rating;

  return (
    <Flex className={styles.rateSummarySection} gap={16}>
      <Flex className={styles.rateCountAndModalBtn} justify="space-between">
        <Flex className={styles.rateCountBox} gap={12} align="center">
          {productRating.rating !== 0 && (
            <Flex gap={8}>
              <Text className={styles.rateCount}>
                {productRating?.rating.toFixed(1)}
              </Text>
              <Text className={styles.rateOutOf}>out of 5</Text>
            </Flex>
          )}
          <Flex className={styles.rateStarsReviewsCount}>
            {productRating && (
              <Rate
                className={styles.productRate}
                value={productRating.rating}
                allowHalf
                disabled
              />
            )}
            <Text>
              {productRating.count} {t("of-reviews")}
            </Text>
          </Flex>
        </Flex>
        <Button
          type="primary"
          size="large"
          onClick={() => setReviewProduct(product)}
        >
          {product.rating.count !== 0
            ? t("wright-review")
            : t("leave-a-review")}
        </Button>
      </Flex>

      {productRating.count !== 0 ? (
        <Flex className={styles.rateStarsProgressBox} vertical gap={8}>
          {[5, 4, 3, 2, 1].map((starValue) => {
            const star = productRating.breakdown.find(
              (s) => s.star === starValue
            );
            const percent = star ? star.percentage : 0;
            return (
              <Flex key={starValue} gap={8} align="center">
                <Text>{starValue}</Text>
                <TbStarFilled color="yellow" size={15} />
                <Progress
                  style={{ flex: 1 }}
                  percent={percent}
                  showInfo={false}
                />
                <Text>{percent}%</Text>
              </Flex>
            );
          })}
        </Flex>
      ) : (
        <Typography.Text strong>{t("item-without-review-yet")}</Typography.Text>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  rateSummarySection: css`
    flex-direction: column;

    ${mq.lg} {
      flex-direction: row;
    }
  `,

  rateCountAndModalBtn: css`
    ${mq.lg} {
      flex-direction: column;
      min-width: max-content;
    }
  `,

  productRate: css`
    font-size: ${token.fontSizeLG}px;
  `,
  rateCountBox: css`
    ${mq.md} {
      flex-direction: column;
      align-items: flex-start;
    }
  `,
  rateStarsProgressBox: css`
    ${mq.lg} {
      width: 100%;
    }
  `,

  rateCount: css`
    font-weight: 700;
    font-size: ${token.fontSizeHeading2}px;
    line-height: 1;
  `,
  rateOutOf: css`
    display: none;

    ${mq.md} {
      display: block;
      font-weight: 700;
      font-size: ${token.fontSizeHeading2}px;
      line-height: 1;
    }
  `,
  rateStarsReviewsCount: css`
    flex-direction: column;

    ${mq.md} {
      flex-direction: row;
      align-items: center;
      gap: ${token.marginXS}px;
    }
  `,
}));
