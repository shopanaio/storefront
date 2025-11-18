'use client';

import { Button, Checkbox, Empty, Flex, List, Space, Typography } from 'antd';
import * as yup from 'yup';
import { makeSection } from '@src/modules/wishlist/components/section/makeSection';
import { WishlistItem, WishlistSectionId } from '@src/modules/wishlist/types';
import { useWishlistApi } from '@src/modules/wishlist/context/WishlistApiContext';
import { useWishlistStore } from '@src/modules/wishlist/state/wishlistStore';

const schema = yup
  .array(
    yup.object({
      id: yup.string().required(),
      title: yup.string().required(),
      sku: yup.string().required(),
      quantity: yup.number().min(1).max(999).required(),
    })
  )
  .max(300)
  .required();

const SavedItemsSectionView = ({
  data,
  invalidate,
}: {
  data: WishlistItem[] | null;
  invalidate: () => void;
}) => {
  void invalidate;
  const { removeItem, moveToCart } = useWishlistApi();
  const toggle = useWishlistStore((state) => state.toggleItemSelection);
  const selected = useWishlistStore((state) => state.selectedItemIds);
  const items = data ?? [];

  if (!items.length) {
    return (
      <Flex vertical gap={12}>
        <Empty description="No items yet" />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={12}>
      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Button
                key="remove"
                type="link"
                danger
                onClick={() => removeItem(item.id)}
              >
                Remove
              </Button>,
              <Button
                key="move"
                type="link"
                onClick={() => moveToCart(item.id)}
              >
                Move to cart
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onChange={() => toggle(item.id)}
                  />
                  <Typography.Text strong>{item.title}</Typography.Text>
                </Space>
              }
              description={`SKU: ${item.sku} · Qty: ${item.quantity}`}
            />
          </List.Item>
        )}
      />
    </Flex>
  );
};

export const SavedItemsSection = makeSection<WishlistItem[]>({
  id: WishlistSectionId.SavedItems,
  selector: (snapshot) => snapshot.items,
  schema,
  displayName: 'SavedItemsSection',
  Component: SavedItemsSectionView,
});
