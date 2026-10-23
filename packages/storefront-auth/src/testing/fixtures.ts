import { AuthError } from '../core/AuthError';
import type {
  AuthConfiguration,
  AuthErrorCode,
  AuthMethods,
} from '../core/types';

export const EMAIL = 'olena@example.com';
export const PHONE = '+380671234567';
/** The email or SMS code the mock sign-in accepts. */
export const MOCK_CODE = '000000';
/** The password the mock sign-in refuses; any other signs in. */
export const WRONG_PASSWORD = 'wrong';

/** Both codes, the password and two providers, as a store with everything enabled. */
export const MOCK_METHODS: AuthMethods = {
  password: {
    signIn: true,
    signUp: true,
    reset: true,
    minLength: 10,
    maxLength: 128,
  },
  emailOtp: { signIn: true, signUp: true, codeLength: 6 },
  phoneOtp: { signIn: true, signUp: true, codeLength: 6 },
  social: [
    { provider: 'google', signUp: true },
    { provider: 'facebook', signUp: true },
  ],
};

export type MethodsArg = 'both' | 'phone' | 'email' | 'none';

export interface MethodArgs {
  /** The codes enabled: both, one of them or none. */
  methods?: MethodsArg;
  passwordSignIn?: boolean;
  passwordSignUp?: boolean;
  passwordReset?: boolean;
  social?: boolean;
  otpSignUp?: boolean;
  minLength?: number;
  maxLength?: number;
}

/** Sign-in methods of a store from a few switches (the properties of a design board). */
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
    social: social ? MOCK_METHODS.social : [],
  };
}

/** The configuration of a store with `methods`. */
export const configurationOf = (
  methods: AuthMethods = MOCK_METHODS
): AuthConfiguration => ({
  methods,
  emailVerificationRequired: false,
  emailVerificationMethod: 'otp',
  defaultLocale: 'uk',
});

/** The error of a step; `rateLimited` waits `retryAfter` seconds from now. */
export const errorOf = (code: AuthErrorCode, retryAfter?: number) =>
  new AuthError(code, code, code === 'rateLimited' ? 429 : 400, retryAfter);
