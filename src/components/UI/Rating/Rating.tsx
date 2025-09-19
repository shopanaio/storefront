"use client";

import { Flex, Typography, Rate, Button } from "antd";
import { createStyles } from "antd-style";
import { TbMessageCircle } from "react-icons/tb";
import { useTranslations } from "next-intl";

const { Text } = Typography;

type RatingSize = "default" | "large";

export interface ProductRatingProps {
  rating: number;
  ratingCount: number;
  className?: string;
  size?: RatingSize;
  showRating?: boolean;
  showCount?: boolean;
  showReviewButton?: boolean;
  compact?: boolean;
  onReviewClick?: () => void;
}

export const ProductRating = ({
  rating,
  ratingCount,
  className,
  showRating = true,
  showCount = true,
  showReviewButton = true,
  compact = false,
  size = "default",
  onReviewClick,
}: ProductRatingProps) => {
  const { styles } = useStyles({ size });
  const t = useTranslations("Product");

  const hasRating = rating && ratingCount > 0;

  // If no rating and review button should be shown
  if (!hasRating && showReviewButton) {
    const buttonText = t("leave-a-review");

    return (
      <Button
        variant="link"
        color="primary"
        size="small"
        icon={<TbMessageCircle size={16} />}
        onClick={onReviewClick}
        className={`${styles.reviewButton} ${className || ""}`}
      >
        {buttonText}
      </Button>
    );
  }

  // If no rating and button is not needed - show nothing
  if (!hasRating) {
    return null;
  }

  // If rating exists - show rating
  return (
    <Flex
      align="center"
      gap={compact ? 4 : 8}
      className={`${styles.ratingContainer} ${className || ""}`}
    >
      {/* Stars are always shown */}
      <Rate className={styles.rate} allowHalf value={rating || 0} disabled />

      {/* Rating number - only if showRating = true */}
      {showRating && <Text>{rating}</Text>}

      {/* Review count - only if showCount = true */}
      {showCount && (
        <Flex align="center" gap={4}>
          <TbMessageCircle size={14} className={styles.reviewIcon} />
          <Text type="secondary">
            {compact
              ? `${ratingCount}`
              : `${ratingCount} ${
                  ratingCount === 1 ? t("review") : t("of-reviews")
                }`}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

const useStyles = createStyles(
  ({ token, css }, { size }: { size: RatingSize }) => ({
    ratingContainer: css`
      width: max-content;
    `,
    rate: css`
      font-size: ${size === "large" ? token.fontSizeLG : token.fontSize}px;
      .ant-rate-star {
        margin-right: 0px !important;
      }
    `,
    reviewButton: css`
      padding: 0;
      justify-content: flex-start;
    `,
    reviewIcon: css`
      color: ${token.colorTextSecondary};
      flex-shrink: 0;
    `,
  })
);
