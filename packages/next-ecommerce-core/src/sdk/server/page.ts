import { createMockPage } from './mockData';
import type { StaticPageData } from '../types';

export async function getStaticPageData(handle: string): Promise<StaticPageData> {
  return { page: createMockPage(handle) };
}
