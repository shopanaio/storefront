'use client';

import { useMemo } from 'react';
import type { Entity } from '@shopana/entity';
import { useProductGroupsState } from './useProductGroupsState';
import { computeBundlePrice } from './useProductBundlePricing';

export interface AddToCartGroupSelectionItem {
  purchasableId: string;
  quantity: number;
  groupId?: string;
}

export interface UseProductGroupsResult {
  selectionsByGroupId: Record<
    string,
    { purchasableId: string; quantity: number }[]
  >;
  toggleItem: (
    groupId: string,
    purchasableId: string,
    isMultiple: boolean
  ) => void;
  setItemQty: (
    groupId: string,
    purchasableId: string,
    quantity: number
  ) => void;
  computedPrice: Entity.Money;
  isAddAllowed: boolean;
  buildChildren: () => AddToCartGroupSelectionItem[];
}

/**
 * Compose groups state with pricing and cart-lines builder for a given product.
 */
export function useProductGroups(
  product: Entity.Product,
  currentVariant: Entity.ProductVariant
): UseProductGroupsResult {
  const { state, toggleItem, setItemQty } = useProductGroupsState(
    product.id
  );

  const selectionsByGroupId = state.selectionsByGroupId;

  const computedPrice = useMemo(() => {
    return computeBundlePrice(
      currentVariant.price,
      product.groups,
      selectionsByGroupId
    );
  }, [currentVariant.price, product.groups, selectionsByGroupId]);

  const isAddAllowed = useMemo(() => {
    const groups = product.groups ?? [];
    for (const g of groups) {
      if (g.isRequired) {
        const selected = selectionsByGroupId[g.id] ?? [];
        if (selected.length === 0) return false;
      }
    }
    return true;
  }, [product.groups, selectionsByGroupId]);

  const buildChildren = () => {
    const children: AddToCartGroupSelectionItem[] = [];
    const groups = product.groups ?? [];
    for (const g of groups) {
      const selected = selectionsByGroupId[g.id] ?? [];
      for (const sel of selected) {
        children.push({
          purchasableId: sel.purchasableId,
          quantity: sel.quantity,
          groupId: g.id,
        });
      }
    }
    return children;
  };

  return {
    selectionsByGroupId,
    toggleItem,
    setItemQty,
    computedPrice,
    isAddAllowed,
    buildChildren,
  };
}
