import { createMockCart } from './mockData';
import type { CartPageData } from '../types';

export async function getCartPageData(): Promise<CartPageData> {
  return { cart: createMockCart() };
}
