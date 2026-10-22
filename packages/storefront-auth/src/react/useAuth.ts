'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthError } from '../core/AuthError';
import type {
  AuthConfiguration,
  AuthMethods,
  AuthStep,
  OtpChannel,
  PasswordResetInput,
  PasswordSignInInput,
  PasswordSignUpInput,
} from '../core/types';
import { useAuthConfiguration } from './useAuthConfiguration';
import { useHeadlessAuthClient } from './useHeadlessAuthClient';

/** Where the sign-in form is; a form renders by `step.type`. */
export type AuthFlowStep =
  /** Nothing sent yet: render the method forms. */
  | { type: 'idle' }
  /** A code was sent to `destination`; render the code field. */
  | {
      type: 'otpSent';
      channel: OtpChannel;
      destination: string;
      /** Seconds until `resend()` is accepted; counts down to 0. */
      resendIn: number;
      /** When the code expires (epoch ms). */
      expiresAt: number;
    }
  /**
   * The email must be confirmed. With `otp`, call `emailOtp.send()` and then `verify(code)`;
   * with `link`, ask the buyer to follow the link in the email and sign in again.
   */
  | { type: 'verificationRequired'; method: 'otp' | 'link'; email: string }
  /** The account was created; sign in with the same credentials. */
  | { type: 'signInRequired'; email: string }
  /** A reset link was sent to `email` if it has an account; ask the buyer to check the inbox. */
  | { type: 'resetLinkSent'; email: string }
  /** The new password is set; sign in with it. */
  | { type: 'passwordReset' }
  /** The verification email was sent to `email` again. */
  | { type: 'verificationSent'; email: string }
  /** Signed in; the session hooks of the SDK already see the user. */
  | { type: 'completed' };

export interface OtpActions {
  /** Sends a code; without an argument, to the destination of the current step. */
  send(destination?: string): Promise<AuthStep | null>;
  verify(code: string): Promise<AuthStep | null>;
  /** Sends the code again to the current destination. */
  resend(): Promise<AuthStep | null>;
}

export interface UseAuthResult {
  /** Configuration is loading (`loading`), ready, or could not be read (`unavailable`). */
  status: 'loading' | 'ready' | 'unavailable';
  configuration: AuthConfiguration | null;
  /** Shortcut for `configuration.methods`. */
  methods: AuthMethods | null;
  step: AuthFlowStep;
  isPending: boolean;
  /** Error of the last action; cleared by the next one. */
  error: AuthError | null;
  password: {
    signIn(input: PasswordSignInInput): Promise<AuthStep | null>;
    signUp(input: PasswordSignUpInput): Promise<AuthStep | null>;
    /**
     * Sends a reset link opening `resetPath` (`/account/reset-password` by default); that page
     * reads the token with `readPasswordResetLink()` and calls `reset()`.
     */
    forgot(
      email: string,
      options?: { resetPath?: string }
    ): Promise<AuthStep | null>;
    /** Sets the new password of a reset link; the buyer then signs in with it. */
    reset(input: PasswordResetInput): Promise<AuthStep | null>;
  };
  emailVerification: {
    /** Sends the verification email again; without an argument, to the email of the step. */
    resend(email?: string): Promise<AuthStep | null>;
  };
  emailOtp: OtpActions;
  phoneOtp: OtpActions;
  social: {
    /** Leaves for the provider; the buyer returns to `returnTo` (the current page) signed in. */
    start(provider: string, options?: { returnTo?: string }): Promise<void>;
  };
  /** Back to the method forms, e.g. to change the email a code was sent to. */
  reset(): void;
}

const IDLE: AuthFlowStep = { type: 'idle' };

/**
 * Everything a sign-in or sign-up form needs: enabled methods, the current step and the
 * actions. Actions never throw: they resolve to the step, or to null with `error` set, so they
 * can be passed to `onSubmit` directly.
 *
 * @example
 * ```tsx
 * const auth = useAuth();
 * if (auth.step.type === 'otpSent') {
 *   return <CodeForm onSubmit={(code) => auth.emailOtp.verify(code)} resendIn={auth.step.resendIn} />;
 * }
 * return <PasswordForm onSubmit={auth.password.signIn} error={auth.error?.code} />;
 * ```
 */
export function useAuth(): UseAuthResult {
  const client = useHeadlessAuthClient();
  const {
    configuration,
    isLoading,
    error: configurationError,
  } = useAuthConfiguration();
  const [step, setStep] = useState<AuthFlowStep>(IDLE);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const destinations = useRef<{ email?: string; phone?: string }>({});
  const resendAt = useRef(0);

  // Count `resendIn` down while a code is waiting.
  const otpSent = step.type === 'otpSent';
  useEffect(() => {
    if (!otpSent) return;
    const timer = setInterval(() => {
      setStep((current) => {
        if (current.type !== 'otpSent' || current.resendIn === 0)
          return current;
        const resendIn = Math.max(
          0,
          Math.ceil((resendAt.current - Date.now()) / 1000)
        );
        return resendIn === current.resendIn
          ? current
          : { ...current, resendIn };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent]);

  // A social sign-in leaves the page with the action still pending. Back from the provider,
  // the browser may restore this page from the back/forward cache with that state.
  useEffect(() => {
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) setIsPending(false);
    };
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, []);

  const run = useCallback(
    async (
      action: () => Promise<AuthStep>,
      context: { email?: string; channel?: OtpChannel; destination?: string }
    ): Promise<AuthStep | null> => {
      setIsPending(true);
      setError(null);
      try {
        const result = await action();
        setStep(toFlowStep(result, context, resendAt));
        return result;
      } catch (value) {
        const failure =
          value instanceof AuthError
            ? value
            : new AuthError('unavailable', String(value), 0);
        // An expired sign-in starts over from the method forms.
        if (failure.code === 'expired') setStep(IDLE);
        setError(failure);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  const otpActions = useCallback(
    (channel: OtpChannel): OtpActions => {
      const remembered = () => destinations.current[channel];
      const send = (destination?: string) => {
        const target = destination ?? remembered();
        if (!target) {
          const failure = new AuthError(
            'invalidInput',
            `No ${channel} to send a code to`,
            0
          );
          setError(failure);
          return Promise.resolve(null);
        }
        destinations.current[channel] = target;
        return run(
          () =>
            channel === 'email'
              ? client.sendEmailOtp({ email: target })
              : client.sendPhoneOtp({ phone: target }),
          {
            channel,
            destination: target,
            email: channel === 'email' ? target : undefined,
          }
        );
      };
      return {
        send,
        resend: () => send(),
        verify: (code: string) => {
          const target = remembered();
          if (!target) return send();
          return run(
            () =>
              channel === 'email'
                ? client.verifyEmailOtp({ email: target, code })
                : client.verifyPhoneOtp({ phone: target, code }),
            {
              channel,
              destination: target,
              email: channel === 'email' ? target : undefined,
            }
          );
        },
      };
    },
    [client, run]
  );

  const emailOtp = useMemo(() => otpActions('email'), [otpActions]);
  const phoneOtp = useMemo(() => otpActions('phone'), [otpActions]);

  const password = useMemo(
    () => ({
      signIn: (input: PasswordSignInInput) => {
        destinations.current.email = input.email;
        return run(() => client.passwordSignIn(input), { email: input.email });
      },
      signUp: (input: PasswordSignUpInput) => {
        destinations.current.email = input.email;
        return run(() => client.passwordSignUp(input), { email: input.email });
      },
      forgot: (email: string, options: { resetPath?: string } = {}) => {
        destinations.current.email = email;
        return run(() => client.requestPasswordReset({ email, ...options }), {
          email,
        });
      },
      reset: (input: PasswordResetInput) =>
        run(() => client.resetPassword(input), {}),
    }),
    [client, run]
  );

  const emailVerification = useMemo(
    () => ({
      resend: (email?: string) => {
        const target = email ?? destinations.current.email;
        if (!target) {
          setError(
            new AuthError(
              'invalidInput',
              'No email to send the verification to',
              0
            )
          );
          return Promise.resolve(null);
        }
        destinations.current.email = target;
        return run(() => client.resendVerificationEmail({ email: target }), {
          email: target,
        });
      },
    }),
    [client, run]
  );

  const social = useMemo(
    () => ({
      start: async (provider: string, options: { returnTo?: string } = {}) => {
        await run(() => client.startSocial({ provider, ...options }), {});
      },
    }),
    [client, run]
  );

  const reset = useCallback(() => {
    setStep(IDLE);
    setError(null);
  }, []);

  return {
    status: isLoading ? 'loading' : configuration ? 'ready' : 'unavailable',
    configuration,
    methods: configuration?.methods ?? null,
    step,
    isPending,
    error: error ?? (step.type === 'idle' ? configurationError : null),
    password,
    emailVerification,
    emailOtp,
    phoneOtp,
    social,
    reset,
  };
}

function toFlowStep(
  result: AuthStep,
  context: { email?: string; channel?: OtpChannel; destination?: string },
  resendAt: { current: number }
): AuthFlowStep {
  switch (result.type) {
    case 'completed':
      return { type: 'completed' };
    case 'otpSent':
      resendAt.current = Date.now() + result.resendAfter * 1000;
      return {
        type: 'otpSent',
        channel: result.channel,
        destination: context.destination ?? '',
        resendIn: result.resendAfter,
        expiresAt: Date.now() + result.expiresIn * 1000,
      };
    case 'verificationRequired':
      return {
        type: 'verificationRequired',
        method: result.method,
        email: context.email ?? '',
      };
    case 'signInRequired':
      return { type: 'signInRequired', email: context.email ?? '' };
    case 'resetLinkSent':
      return { type: 'resetLinkSent', email: context.email ?? '' };
    case 'passwordReset':
      return { type: 'passwordReset' };
    case 'verificationSent':
      return { type: 'verificationSent', email: context.email ?? '' };
    case 'redirect':
      // The page is leaving for the provider; the form stays as it is.
      return IDLE;
  }
}
