'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { model } from '@shopana/storefront-sdk';
import { useProductGroupsState } from './useProductGroupsState';
import { computeBundlePrice } from './useProductBundlePricing';

export interface AddToCartGroupSelectionItem {
  componentItemId: string;
  purchasableId: string;
  quantity: number;
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
  computedPrice: model.Money;
  isAddAllowed: boolean;
  buildChildren: () => AddToCartGroupSelectionItem[];
}

/**
 * Compose groups state with pricing and cart-lines builder for a given product.
 */
export function useProductGroups(
  product: model.Product,
  currentVariant: model.ProductVariant
): UseProductGroupsResult {
  const { state, initialize, toggleItem, setItemQty } = useProductGroupsState(
    product.id
  );

  const resolvedSelectionsByGroupId = useMemo(() => {
    const selections: Record<
      string,
      { purchasableId: string; quantity: number }[]
    > = {};

    for (const group of product.groups ?? []) {
      selections[group.id] = group.items
        .filter((item) => item.selected || item.required)
        .map((item) => ({
          purchasableId: item.node.id,
          quantity: Math.max(item.quantity ?? 0, item.minQuantity ?? 0, 1),
        }));
    }

    return selections;
  }, [product.groups]);

  useEffect(() => {
    initialize(currentVariant.id, resolvedSelectionsByGroupId);
  }, [currentVariant.id, initialize, resolvedSelectionsByGroupId]);

  const selectionsByGroupId =
    state.variantId === currentVariant.id
      ? state.selectionsByGroupId
      : resolvedSelectionsByGroupId;

  const handleToggleItem = useCallback(
    (groupId: string, purchasableId: string, isMultiple: boolean) => {
      const group = product.groups.find((item) => item.id === groupId);
      const item = group?.items.find(
        (groupItem) => groupItem.node.id === purchasableId
      );
      if (!group || !item || item.availableForSale === false) {
        return;
      }

      const selected = selectionsByGroupId[groupId] ?? [];
      const isSelected = selected.some(
        (selection) => selection.purchasableId === purchasableId
      );
      const minSelection = group.minSelection ?? (group.isRequired ? 1 : 0);

      if (isSelected && (item.required || selected.length <= minSelection)) {
        return;
      }

      if (
        !isSelected &&
        group.maxSelection != null &&
        selected.length >= group.maxSelection
      ) {
        return;
      }

      toggleItem(
        groupId,
        purchasableId,
        isMultiple,
        Math.max(item.quantity ?? 0, item.minQuantity ?? 0, 1)
      );
    },
    [product.groups, selectionsByGroupId, toggleItem]
  );

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
      const selected = selectionsByGroupId[g.id] ?? [];
      const minSelection = g.minSelection ?? (g.isRequired ? 1 : 0);
      if (selected.length < minSelection) {
        return false;
      }

      if (
        selected.some((selection) => {
          const item = g.items.find(
            (groupItem) => groupItem.node.id === selection.purchasableId
          );
          return item?.availableForSale === false;
        })
      ) {
        return false;
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
        const componentItem = g.items.find(
          (item) => item.node.id === sel.purchasableId
        );
        if (!componentItem) continue;

        children.push({
          componentItemId: componentItem.id,
          purchasableId: sel.purchasableId,
          quantity: sel.quantity,
        });
      }
    }
    return children;
  };

  return {
    selectionsByGroupId,
    toggleItem: handleToggleItem,
    setItemQty,
    computedPrice,
    isAddAllowed,
    buildChildren,
  };
}
