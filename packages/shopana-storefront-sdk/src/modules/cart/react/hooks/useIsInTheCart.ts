"use client";

import { useCartLineItem } from './useCartSelectors';

export interface UseIsInCartProps {
  purchasableId: string;
}

export interface UseIsInCartReturn {
  isInCart: boolean;
  quantity: number;
  cartItemId: string;
}

const useIsInTheCart = (input: UseIsInCartProps): { isInCart: boolean; quantity: number; cartItemId: string } => {
  const cartLine = useCartLineItem(input.purchasableId);

  if (!cartLine) {
    return { isInCart: false, quantity: 0, cartItemId: "" };
  }

  return {
    isInCart: true,
    quantity: cartLine.quantity,
    cartItemId: cartLine.id,
  };
};

export default useIsInTheCart;
