import { useEffect, useState } from "react";

/**
 * Hook that manages initial loading state for components that should show skeleton on open
 * @param isOpen - Whether the component is open
 * @param initialLoadingDuration - Duration in ms to show initial loading (default: 300ms)
 * @returns initialLoading state
 */
export const useInitialLoading = (
  isOpen: boolean,
  initialLoadingDuration: number = 1000
) => {
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show skeleton immediately when opening
      setInitialLoading(true);

      // Hide skeleton after specified duration
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, initialLoadingDuration);

      return () => clearTimeout(timer);
    } else {
      // Reset state when closed
      setInitialLoading(false);
    }
  }, [isOpen, initialLoadingDuration]);

  return initialLoading;
};
