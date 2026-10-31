import type { IModalStackItem } from '../types';
import {
  encodeModalEntries,
  projectModalStack,
  withModalProjection,
} from './projection';

/** Share the first runtime level, including instances opened without URL projection. */
export function createModalStackUrl(
  url: URL,
  items: readonly IModalStackItem[]
): string {
  const root = items[0];
  const entries = projectModalStack(root ? [{ ...root, url: true }] : []);
  return withModalProjection(url, encodeModalEntries(entries)).href;
}
