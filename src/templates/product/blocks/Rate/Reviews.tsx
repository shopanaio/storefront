'use client';

import {
  Typography,
  Flex,
  Button,
  Divider,
  Popover,
  Checkbox,
  Rate,
  Empty,
} from 'antd';
import { useTranslations } from 'next-intl';
import { ProductRateItem } from './ProductRateItem';
import { TbStar } from 'react-icons/tb';
import { useState, useTransition } from 'react';
import { createStyles } from 'antd-style';
import { ReviewSort } from 'codegen/schema-client';
import type { model } from '@shopana/storefront-sdk';
import type { ReviewsData } from '@shopana/storefront-sdk/queries/Reviews';
import {
  ProductReviewsPagination,
  usePaginationQuery,
} from '@shopana/storefront-sdk/graphql/apollo';
import { SortPopover, SortOption } from './SortPopover';
import { LoadMoreBtn } from '@src/templates/shared/atoms';
import {
  PRODUCT_REVIEWS_DEFAULT_SORT,
  PRODUCT_REVIEWS_PAGE_SIZE,
} from './config';

interface Props {
  productRef: ReviewsData;
}

type ReviewNode = NonNullable<
  ReturnType<typeof ProductReviewsPagination.getConnection>
>['edges'][number]['node'];

const mapReview = (review: ReviewNode): model.Review => ({
  id: review.id,
  iid: review.id,
  rating: review.rating,
  title: review.title,
  message: review.message,
  displayName: review.author.displayName,
  locale: review.locale,
  verifiedPurchase: review.verifiedPurchase,
  status: review.status === 'PUBLISHED' ? 'APPROVED' : 'PENDING',
  helpfulYes: review.metrics.helpfulYes,
  helpfulNo: review.metrics.helpfulNo,
  meHelpful: review.viewerEngagement.meHelpful === 'LIKE',
  createdAt: review.createdAt,
  editedAt: review.editedAt,
});

export const ReviewsSection = ({ productRef }: Props) => {
  const { styles } = useStyles();
  const t = useTranslations('Product');
  const [sort, setSort] = useState<ReviewSort>(
    PRODUCT_REVIEWS_DEFAULT_SORT
  );
  const [starFilter, setStarFilter] = useState<number[]>([]);
  const [starFilterOpen, setStarFilterOpen] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasFilters = starFilter.length > 0 || onlyVerified;
  const starOptions = [5, 4, 3, 2, 1];

  const {
    data: queryData,
    loadNext,
    hasNext,
    isLoadingNext,
    refetch,
  } = usePaginationQuery(ProductReviewsPagination, {
    handle: productRef.handle,
    first: PRODUCT_REVIEWS_PAGE_SIZE,
    sort,
  });
  const data = queryData?.product;

  const reviewsConnection = data?.reviews;
  const reviewEdges = reviewsConnection?.edges ?? [];
  const totalCount = reviewsConnection?.totalCount ?? 0;
  const reviews = reviewEdges.map((edge) => edge.node);

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(PRODUCT_REVIEWS_PAGE_SIZE);
    }
  };

  const handleSortChange = (newSort: ReviewSort) => {
    if (newSort !== sort) {
      startTransition(() => {
        setSort(newSort);
        void refetch({ sort: newSort });
      });
    }
  };

  const sortOptions: SortOption<
    ReviewSort | 'most-relevant'
  >[] = [
    { value: 'most-relevant', label: t('most-relevant'), disabled: true },
    { value: ReviewSort.Newest, label: t('most-recent') },
    { value: ReviewSort.MostHelpful, label: t('most-helpful') },
    { value: ReviewSort.HighestRating, label: t('highest-rated') },
    { value: ReviewSort.LowestRating, label: t('lowest-rated') },
  ];

  const getStarLabel = () => {
    const sorted = [...starFilter].sort((a, b) => a - b);
    if (sorted.length === 0) return t('stars-rating');
    if (sorted.length === 5) return t('all-stars');
    if (sorted.length === 1) return `${sorted[0]} ${t('stars')}`;
    return `${sorted.join(', ').replace(/, ([^,]*)$/, ' and $1')} ${t(
      'stars'
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
          {t('showing')} {reviews.length} {t('of')} {totalCount}
        </Typography.Text>
        <Flex align="center">
          <Typography.Text strong>{t('sort-by')}</Typography.Text>
          <Divider className={styles.divider} type="vertical" />
          <SortPopover
            options={sortOptions}
            value={sort}
            onChange={(val) => handleSortChange(val as ReviewSort)}
            loading={isPending || isLoadingNext}
            buttonClassName={styles.sortBtn}
            title={t('sort-by')}
          />
        </Flex>
      </Flex>
      <Flex gap={12} wrap>
        <Popover
          placement="bottom"
          title={t('stars-rating')}
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
                      ? 'transparent'
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
            color={starFilter.length !== 0 ? 'primary' : 'default'}
          >
            {getStarLabel()}
          </Button>
        </Popover>
        <Button
          variant="outlined"
          color={onlyVerified ? 'primary' : 'default'}
          onClick={() => setOnlyVerified((prev) => !prev)}
        >
          {t('verified-only')}
        </Button>
        {hasFilters && (
          <Button variant="link" color="primary" onClick={clearReviewsFilters}>
            {t('clear-all')}
          </Button>
        )}
      </Flex>
      {reviews.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('no-reviews-found')}
        />
      ) : (
        <Flex vertical gap={16}>
          {reviews.map((node) => (
            <ProductRateItem
              key={node.id}
              node={mapReview(node)}
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
