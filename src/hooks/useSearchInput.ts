import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { useModalStore } from '@src/store/appStore';

/**
 * useSearchInput
 * ----------------
 * Manages the value of a search input field while providing:
 * 1. debouncedTerm – throttled version for inexpensive side-effects (e.g. network requests)
 * 2. deferredSearchTerm – React 18 deferred value to prevent expensive renders while typing
 * Uses global searchTerm from zustand store for synchronization across components
 *
 * @param delay debounce delay in ms (default: 300)
 */
export const useSearchInput = (
  initialValue: string = '',
  delay: number = 300
) => {
  const searchTerm = useModalStore((state) => state.searchTerm);
  const setSearchTerm = useModalStore((state) => state.setSearchTerm);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  // Create a debounced setter that survives re-renders
  const debouncedUpdate = useMemo(
    () =>
      debounce(
        (value: string) => {
          setDebouncedTerm(value);
        },
        delay,
        { leading: true }
      ),
    [delay]
  );

  // Keep debouncedTerm in sync with searchTerm
  useEffect(() => {
    debouncedUpdate(searchTerm);
    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchTerm, debouncedUpdate]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  };
};
