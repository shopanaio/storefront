import { useState, useDeferredValue, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

export const useSearchInput = (delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // React 18 feature – lets React delay non-urgent updates
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Create a debounced setter that survives re-renders
  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedTerm(value);
      }, delay),
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
    deferredSearchTerm,
  };
};
