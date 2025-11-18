import { useCallback } from "react";
import { WishlistItem } from "@src/modules/wishlist/types";
import { useWishlistActions } from "@src/modules/wishlist";

export type WishlistItemInput = {
  id: string;
  title: string;
  sku?: string | null;
  quantity?: number;
  image?: string | null;
  currency?: string | null;
  unitPrice?: number | null;
  note?: string | null;
  tags?: string[];
};

const buildWishlistItem = (input: WishlistItemInput): WishlistItem => {
  const timestamp = new Date().toISOString();
  return {
    id: input.id,
    title: input.title,
    sku: input.sku ?? input.id,
    quantity: input.quantity ?? 1,
    image: input.image ?? undefined,
    currency: input.currency ?? undefined,
    unitPrice: input.unitPrice ?? undefined,
    note: input.note ?? undefined,
    tags: input.tags,
    addedAt: timestamp,
    updatedAt: timestamp,
  };
};

export const useAddItemToWishlist = () => {
  const { addItem } = useWishlistActions();

  const handleAddItem = useCallback(
    async (input: WishlistItemInput) => {
      const wishlistItem = buildWishlistItem(input);
      await addItem(wishlistItem);
    },
    [addItem]
  );

  return { addItem: handleAddItem };
};
