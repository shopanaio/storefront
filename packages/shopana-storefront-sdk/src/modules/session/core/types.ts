import { model } from '../../../model/namespace';

/**
 * Session data structure
 */
export interface Session {
  user: model.User | null;
  token?: string;
  expiresAt?: string;
}

/**
 * Input for sign in
 */
export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Input for sign up
 */
export interface SignUpInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Input for password reset request
 */
export interface ForgotPasswordInput {
  email: string;
}

/**
 * Input for password reset
 */
export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
}

/**
 * Options for mutation callbacks
 */
export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error?: any) => void;
}
