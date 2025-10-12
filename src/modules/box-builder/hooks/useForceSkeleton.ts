import { useEffect, useState } from 'react';

/**
 * Hook to force showing skeleton for a specified duration
 * @param delay - Delay in milliseconds before hiding skeleton (default: 300ms)
 * @returns boolean indicating whether to show skeleton
 */
export const useForceSkeleton = (delay: number = 300): boolean => {
  const [forceSkeleton, setForceSkeleton] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => setForceSkeleton(false), delay);
    return () => clearTimeout(timeoutId);
  }, [delay]);

  return forceSkeleton;
};
