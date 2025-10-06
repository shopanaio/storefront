/**
 * Standard validation callbacks interface for all checkout forms.
 * Follows explicit validation state pattern used in enterprise systems.
 *
 * @example
 * ```tsx
 * function MyForm({ onValid, onInvalid }: ValidationCallbacks) {
 *   useEffect(() => {
 *     if (isFormValid) {
 *       onValid();
 *     } else {
 *       onInvalid({ field: 'error message' });
 *     }
 *   }, [formData]);
 * }
 * ```
 */
export interface ValidationCallbacks {
  /**
   * Called when form data passes validation.
   * Must be called explicitly to mark section as valid.
   */
  onValid: () => void;

  /**
   * Called when form data fails validation.
   * Must be called explicitly to mark section as invalid.
   * @param errors - Optional map of field-level errors for debugging
   */
  onInvalid: (errors?: Record<string, string>) => void;
}
