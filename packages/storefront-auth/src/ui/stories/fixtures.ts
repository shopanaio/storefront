import { AuthError } from '../../core/AuthError';
import type { AuthErrorCode, AuthMethods } from '../../core/types';

export type MethodsArg = 'both' | 'phone' | 'email' | 'none';

export interface MethodArgs {
  methods?: MethodsArg;
  passwordSignIn?: boolean;
  passwordSignUp?: boolean;
  passwordReset?: boolean;
  social?: boolean;
  otpSignUp?: boolean;
  minLength?: number;
  maxLength?: number;
}

/** Methods of a board's properties: `methods`, `passwordSignIn`, `social`… */
export function methodsOf({
  methods = 'both',
  passwordSignIn = true,
  passwordSignUp = false,
  passwordReset = true,
  social = true,
  otpSignUp = true,
  minLength = 10,
  maxLength = 128,
}: MethodArgs = {}): AuthMethods {
  return {
    password: {
      signIn: passwordSignIn,
      signUp: passwordSignUp,
      reset: passwordReset,
      minLength,
      maxLength,
    },
    emailOtp: {
      signIn: methods === 'both' || methods === 'email',
      signUp: otpSignUp,
      codeLength: 6,
    },
    phoneOtp: {
      signIn: methods === 'both' || methods === 'phone',
      signUp: otpSignUp,
      codeLength: 6,
    },
    social: social
      ? [
          { provider: 'google', signUp: true },
          { provider: 'facebook', signUp: true },
        ]
      : [],
  };
}

/** The error of a step; `rateLimited` waits `retryAfter` seconds. */
export const errorOf = (code: AuthErrorCode, retryAfter?: number) =>
  new AuthError(code, code, code === 'rateLimited' ? 429 : 400, retryAfter);

export const EMAIL = 'olena@example.com';
export const PHONE = '+380671234567';
