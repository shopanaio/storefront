import {
  disableBodyScroll,
  enableBodyScroll,
} from 'body-scroll-lock';
import {
  MutableRefObject,
  useLayoutEffect,
  useRef,
} from 'react';

/**
 * Locks and unlocks body scrolling based on `isLocked`.
 * Returns a ref that should be attached to the scroll container.
 */
const useBodyScrollLock = <T extends HTMLElement>(
  isLocked: boolean
): MutableRefObject<T | null> => {
  const targetRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    const node = targetRef.current;

    if (!node) {
      return;
    }

    if (isLocked) {
      disableBodyScroll(node);
    } else {
      enableBodyScroll(node);
    }

    return () => {
      enableBodyScroll(node);
    };
  }, [isLocked]);

  return targetRef;
};

export default useBodyScrollLock;
