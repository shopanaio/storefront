import { useSubmitAttempted } from '#checkout/hooks/useSubmitAttempted';
import { useMissingRequiredSections } from '#checkout/state/selectors';
import type { SectionId } from '#checkout/state/interface';

/**
 * Whether the section is still not filled in once the buyer pressed "place order": its empty
 * cards turn red and say what to fill in.
 */
export function useMissingAfterSubmit(section: SectionId): boolean {
  const attempted = useSubmitAttempted();
  const missing = useMissingRequiredSections();
  return attempted && missing.includes(section);
}
