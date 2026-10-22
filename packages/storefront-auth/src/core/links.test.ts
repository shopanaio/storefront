import { describe, expect, it } from 'vitest';
import { readEmailVerificationLink, readPasswordResetLink } from './links';

describe('links from IAM', () => {
  it('reads the outcome of an email verification link', () => {
    expect(readEmailVerificationLink('?lang=uk&email_verified=true')).toEqual({
      verified: true,
    });
    expect(readEmailVerificationLink('?error=invalid_token')).toEqual({
      error: 'expired',
    });
    expect(readEmailVerificationLink('?lang=uk')).toBeNull();
  });

  it('reads the token of a password reset link', () => {
    expect(readPasswordResetLink('?token=reset-token')).toEqual({
      token: 'reset-token',
    });
    expect(readPasswordResetLink('?error=invalid_token')).toEqual({
      error: 'expired',
    });
  });
});
