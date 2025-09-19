import { useState, useDeferredValue, useEffect, useMemo } from "react";
import { debounce } from "lodash";

/**
 * useSearchInput
 * ----------------
 * Manages the value of a search input field while providing:
 * 1. debouncedTerm – throttled version for inexpensive side-effects (e.g. network requests)
 * 2. deferredSearchTerm – React 18 deferred value to prevent expensive renders while typing
 *
 * @param delay debounce delay in ms (default: 300)
 */
export const useSearchInput = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // React 18 feature – lets React delay non-urgent updates
  const deferredSearchTerm = useDeferredValue(searchTerm);

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
    deferredSearchTerm,
  };
};
