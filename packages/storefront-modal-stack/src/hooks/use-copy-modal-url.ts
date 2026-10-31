'use client';

import { useCallback, useContext } from 'react';
import { ModalStackContext } from '../context/context';
import { useModalStackStore } from '../store/modals';
import { createModalStackUrl } from '../url/share-url';

/** Copies the page URL with the first level of the stack, even one opened without projection. */
export function useCopyModalStackUrl() {
  const context = useContext(ModalStackContext);

  return useCallback(() => {
    const items = context ? useModalStackStore.getState().items : [];
    const url = createModalStackUrl(new URL(window.location.href), items);
    return navigator.clipboard.writeText(url);
  }, [context]);
}
