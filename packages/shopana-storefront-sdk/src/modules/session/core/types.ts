import { model } from '../../../model/namespace';

/**
 * Session data structure. The access token is not part of it: the browser keeps it in memory
 * inside the session client and never in React state or cookies it can read.
 */
export interface Session {
  user: model.User | null;
  /** When the current access token expires (ISO 8601). */
  expiresAt?: string;
}

/**
 * Input for sign in
 */
export interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Input for sign up
 */
export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  rememberMe?: boolean;
}

/**
 * Input for password reset request
 */
export interface ForgotPasswordInput {
  email: string;
  redirectTo?: string;
}

/**
 * Input for password reset
 */
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}
