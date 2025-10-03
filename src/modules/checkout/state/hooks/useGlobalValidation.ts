/**
 * Global validation helper hook that exposes derived submission readiness
 * and missing required sections using checkout selectors.
 */
import { useCanSubmit, useMissingRequiredSections } from '@src/modules/checkout/state/selectors';

export function useGlobalValidation() {
  const canSubmit = useCanSubmit();
  const missingRequiredSections = useMissingRequiredSections();
  return { canSubmit, missingRequiredSections } as const;
}
