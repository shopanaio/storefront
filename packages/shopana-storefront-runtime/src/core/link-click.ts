import type { MouseEvent } from 'react';

/** A click the browser should handle itself: new tab or window, download, other button. */
export const isOwnClick = (
  event: MouseEvent<HTMLAnchorElement>,
  target: string | undefined,
  download: unknown
) =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  (target !== undefined && target !== '_self') ||
  download !== undefined;
