import React from 'react';
import { Button, Progress, Typography } from 'antd';
import { createStyles } from 'antd-style';

const { Text } = Typography;

interface ListingPaginationProps {
  currentCount: number;
  totalCount: number;
  hasNext: boolean;
  isLoadingNext: boolean;
  onLoadMore: () => void;
  summaryLabel: string;
  loadMoreLabel: string;
}

export const ListingPagination: React.FC<ListingPaginationProps> = ({
  currentCount,
  totalCount,
  hasNext,
  isLoadingNext,
  onLoadMore,
  summaryLabel,
  loadMoreLabel,
}) => {
  const { styles, theme } = useStyles();
  const progressPercent =
    totalCount > 0 ? (currentCount / totalCount) * 100 : 0;

  return (
    <div className={styles.container}>
      <Text>{summaryLabel}</Text>
      <Progress
        percent={progressPercent}
        showInfo={false}
        className={styles.progressBar}
        strokeWidth={6}
        strokeColor={theme.colorPrimary}
      />
      {hasNext && (
        <div className={styles.loadMoreContainer}>
          <Button
            type="primary"
            size="large"
            loading={isLoadingNext}
            onClick={onLoadMore}
            className={styles.loadMoreButton}
          >
            {loadMoreLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 400px;
    width: 100%;
    flex-grow: 1;
    margin: 0 auto;
  `,
  progressBar: css`
    & .ant-progress-outer {
      padding: 0 !important;
    }
  `,
  loadMoreContainer: css`
    display: flex;
    justify-content: center;
    padding: ${token.padding}px 0;
  `,
  loadMoreButton: css`
    min-width: 200px;
  `,
}));
