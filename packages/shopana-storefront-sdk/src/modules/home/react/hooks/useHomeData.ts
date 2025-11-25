'use client';

import { useHomeDataContext } from '../context/HomeDataContext';
import type { HomeTemplateData } from '../../core/types';

export function useHomeData(): HomeTemplateData {
  const { data } = useHomeDataContext();
  return data;
}
