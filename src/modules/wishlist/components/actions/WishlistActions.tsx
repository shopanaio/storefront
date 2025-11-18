'use client';

import { Alert, Button, Flex } from 'antd';
import { useWishlistStore } from '@src/modules/wishlist/state/wishlistStore';

interface Props {
  validationError: string | null;
  onClearError: () => void;
}

export const WishlistActions = ({ validationError, onClearError }: Props) => {
  const counts = useWishlistStore((state) => state.counts);
  const clearSelection = useWishlistStore((state) => state.clearSelection);
  const selectAll = useWishlistStore((state) => state.selectAll);

  return (
    <Flex vertical gap={12}>
      {validationError ? (
        <Alert
          type="error"
          message={validationError}
          closable
          onClose={onClearError}
        />
      ) : null}
      <Flex gap={8}>
        <Button onClick={selectAll} type="default">
          Select all ({counts.totalItems})
        </Button>
        <Button onClick={clearSelection} disabled={!counts.selectedItems}>
          Clear selection
        </Button>
      </Flex>
    </Flex>
  );
};
