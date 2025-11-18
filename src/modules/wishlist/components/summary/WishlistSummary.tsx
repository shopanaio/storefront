'use client';

import { Card, Statistic } from 'antd';
import { useWishlistStore } from '@src/modules/wishlist/state/wishlistStore';

export const WishlistSummary = () => {
  const counts = useWishlistStore((state) => state.counts);

  return (
    <Card title="Wishlist summary">
      <Statistic title="Items saved" value={counts.totalItems} />
      <Statistic title="Selected items" value={counts.selectedItems} />
      <Statistic title="Shareable" value={counts.shareableItems} />
    </Card>
  );
};
