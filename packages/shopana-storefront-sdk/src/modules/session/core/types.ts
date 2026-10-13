import { model } from '../../../model/namespace';

/**
 * Session data structure
 */
export interface Session {
  user: model.User | null;
  accessToken: string;
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
