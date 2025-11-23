'use client';

import { useContext } from 'react';

import type { ShopConfig } from './types';
import { ShopContext } from './ShopContext';

export function useShop(): ShopConfig {
  const config = useContext(ShopContext);

  if (!config) {
    throw new Error('useShop must be used within ShopProvider');
  }

  return config;
}

