/**
 * Messages of a save the backend rejected for good: user errors of the mutation, none of
 * them retryable. Sending the same input again gets the same answer, so it is not retried.
 * Network and GraphQL errors return `null`: they are worth retrying.
 */
export function definitiveRejection(error: unknown): string[] | null {
  if (!Array.isArray(error) || error.length === 0) {
    return null;
  }
  const userErrors = error.filter(
    (item): item is { message: string; retryable: boolean } =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.message === 'string' &&
      typeof item.retryable === 'boolean'
  );
  return userErrors.length === error.length &&
    userErrors.every((item) => !item.retryable)
    ? userErrors.map((item) => item.message)
    : null;
}
