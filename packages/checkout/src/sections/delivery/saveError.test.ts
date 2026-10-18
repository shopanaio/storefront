import { describe, expect, it } from 'vitest';
import { definitiveRejection } from './saveError';

describe('definitiveRejection', () => {
  it('returns the messages of user errors that are not retryable', () => {
    expect(
      definitiveRejection([
        { code: 'INVALID', field: ['customerInput'], message: 'Wrong branch', retryable: false },
      ])
    ).toEqual(['Wrong branch']);
  });

  it('retries a retryable user error, a GraphQL error and a network error', () => {
    expect(
      definitiveRejection([{ code: 'BUSY', message: 'Try again', retryable: true }])
    ).toBeNull();
    expect(definitiveRejection([{ message: 'Internal server error' }])).toBeNull();
    expect(definitiveRejection(new Error('Failed to fetch'))).toBeNull();
  });
});
