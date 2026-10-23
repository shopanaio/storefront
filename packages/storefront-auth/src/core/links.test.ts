import { describe, expect, it } from 'vitest';
import {
  clearPasswordResetLink,
  readEmailVerificationLink,
  readPasswordResetLink,
} from './links';

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

  it('removes only the reset token from the address bar', () => {
    history.replaceState(
      null,
      '',
      '/account/reset-password?token=reset-token&lang=uk#form'
    );

    clearPasswordResetLink();

    expect(`${location.pathname}${location.search}${location.hash}`).toBe(
      '/account/reset-password?lang=uk#form'
    );
  });
});
