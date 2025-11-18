"use client";

import {
  Typography,
  Flex,
  Button,
  Divider,
  Popover,
  Checkbox,
  Rate,
  Empty,
} from "antd";
import { useTranslations } from "next-intl";
import { ProductRateItem } from "./ProductRateItem";
import { TbStar } from "react-icons/tb";
import { useState, useTransition } from "react";
import { createStyles } from "antd-style";
import { ProductReviewSort, ApiProductReview } from "codegen/schema-client";
import { usePaginationFragment } from "react-relay";
import { Reviews$key } from "@src/queries/Reviews/__generated__/Reviews.graphql";
import Reviews from "@src/queries/Reviews";
import { SortPopover, SortOption } from "./SortPopover";
import { LoadMoreBtn } from "@src/components/Home/LoadMoreBtn";
import {
  PRODUCT_REVIEWS_DEFAULT_SORT,
  PRODUCT_REVIEWS_PAGE_SIZE,
} from "./config";

interface Props {
  productRef: Reviews$key;
}

export const ReviewsSection = ({ productRef }: Props) => {
  const { styles } = useStyles();
  const t = useTranslations("Product");
  const [sort, setSort] = useState<ProductReviewSort>(
    PRODUCT_REVIEWS_DEFAULT_SORT
  );
  const [starFilter, setStarFilter] = useState<number[]>([]);
  const [starFilterOpen, setStarFilterOpen] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasFilters = starFilter.length > 0 || onlyVerified;
  const starOptions = [5, 4, 3, 2, 1];

  const { data, loadNext, hasNext, isLoadingNext, refetch } =
    usePaginationFragment(Reviews, productRef);

  const reviewsConnection = data.reviews;
  const reviewEdges = reviewsConnection?.edges ?? [];
  const totalCount = reviewsConnection?.totalCount ?? 0;
  const reviews = reviewEdges.map((edge) => edge.node);

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(PRODUCT_REVIEWS_PAGE_SIZE);
    }
  };

  const handleSortChange = (newSort: ProductReviewSort) => {
    if (newSort !== sort) {
      startTransition(() => {
        setSort(newSort);
        refetch(
          {
            sort: newSort,
          },
          {
            fetchPolicy: "store-and-network",
            UNSTABLE_renderPolicy: "partial",
          }
        );
      });
    }
  };

  const sortOptions: SortOption<
    ProductReviewSort | "most-relevant" | "lowest-rated"
  >[] = [
    { value: "most-relevant", label: t("most-relevant"), disabled: true },
    { value: ProductReviewSort.CreatedAtDesc, label: t("most-recent") },
    { value: ProductReviewSort.HelpfulYesDesc, label: t("most-helpful") },
    { value: ProductReviewSort.RatingDesc, label: t("highest-rated") },
    { value: "lowest-rated", label: t("lowest-rated"), disabled: true },
  ];

  const getStarLabel = () => {
    const sorted = [...starFilter].sort((a, b) => a - b);
    if (sorted.length === 0) return t("stars-rating");
    if (sorted.length === 5) return t("all-stars");
    if (sorted.length === 1) return `${sorted[0]} ${t("stars")}`;
    return `${sorted.join(", ").replace(/, ([^,]*)$/, " and $1")} ${t(
      "stars"
    )}`;
  };

  const clearReviewsFilters = () => {
    setStarFilter([]);
    setOnlyVerified(false);
  };

  return (
    <>
      <Flex justify="space-between" align="center" wrap>
        <Typography.Text strong>
          {t("showing")} {reviews.length} {t("of")} {totalCount}
        </Typography.Text>
        <Flex align="center">
          <Typography.Text strong>{t("sort-by")}</Typography.Text>
          <Divider className={styles.divider} type="vertical" />
          <SortPopover
            options={sortOptions}
            value={sort}
            onChange={(val) => handleSortChange(val as ProductReviewSort)}
            loading={isPending || isLoadingNext}
            buttonClassName={styles.sortBtn}
            title={t("sort-by")}
          />
        </Flex>
      </Flex>
      <Flex gap={12} wrap>
        <Popover
          placement="bottom"
          title={t("stars-rating")}
          trigger="click"
          open={starFilterOpen}
          onOpenChange={() => setStarFilterOpen((prev) => !prev)}
          content={
            <Flex vertical gap={8}>
              {starOptions.map((star) => (
                <Flex
                  key={star}
                  align="center"
                  gap={8}
                  onClick={() =>
                    setStarFilter((prev) =>
                      prev.includes(star)
                        ? prev.filter((s) => s !== star)
                        : [...prev, star]
                    )
                  }
                  style={{
                    background: starFilter.includes(star)
                      ? "transparent"
                      : undefined,
                  }}
                >
                  <Checkbox checked={starFilter.includes(star)} />
                  <Rate
                    className={styles.productRate}
                    value={star}
                    allowHalf
                    disabled
                  />
                  {star}
                </Flex>
              ))}
            </Flex>
          }
        >
          <Button
            icon={<TbStar />}
            variant="outlined"
            color={starFilter.length !== 0 ? "primary" : "default"}
          >
            {getStarLabel()}
          </Button>
        </Popover>
        <Button
          variant="outlined"
          color={onlyVerified ? "primary" : "default"}
          onClick={() => setOnlyVerified((prev) => !prev)}
        >
          {t("verified-only")}
        </Button>
        {hasFilters && (
          <Button variant="link" color="primary" onClick={clearReviewsFilters}>
            {t("clear-all")}
          </Button>
        )}
      </Flex>
      {reviews.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("no-reviews-found")}
        />
      ) : (
        <Flex vertical gap={16}>
          {reviews.map((node) => (
            <ProductRateItem
              key={node.id}
              node={node as unknown as ApiProductReview}
            />
          ))}
          <LoadMoreBtn
            hasNext={hasNext}
            handleLoadMore={handleLoadMore}
            isLoadingNext={isLoadingNext}
          />
        </Flex>
      )}
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  sortBtn: css`
    padding: 0;
  `,
  divider: css`
    font-size: ${token.fontSizeHeading3}px;
    font-weight: 500;
    border-color: ${token.colorText};
  `,
  productRate: css`
    font-size: ${token.fontSizeLG}px;
    .ant-rate-star {
      margin-left: ${token.marginXXS}px !important;
    }
  `,
}));
