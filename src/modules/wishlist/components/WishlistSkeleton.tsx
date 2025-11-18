'use client';

import { Skeleton } from 'antd';

interface Props {
  isReady: boolean;
}

export const WishlistSkeleton = ({ isReady }: Props) => {
  if (isReady) return null;
  return (
    <div>
      <Skeleton active paragraph={{ rows: 4 }} />
      <Skeleton active paragraph={{ rows: 3 }} />
    </div>
  );
};
