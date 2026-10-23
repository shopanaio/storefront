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
import { useSecondsUntil } from './useSecondsUntil';

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
      /** When `resend()` is accepted (epoch ms). */
      resendAt: number;
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

/**
 * What an action resolved to: the next step, or the error it failed with (also in
 * `auth.error` until the next action).
 */
export type AuthOutcome = AuthStep | AuthError;

export interface OtpActions {
  /**
   * Sends a code; without an argument, to the last destination of this channel — for the email,
   * also the email of the last password sign-in, sign-up or reset.
   */
  send(destination?: string): Promise<AuthOutcome>;
  verify(code: string): Promise<AuthOutcome>;
  /** Sends the code again to the current destination. */
  resend(): Promise<AuthOutcome>;
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
    signIn(input: PasswordSignInInput): Promise<AuthOutcome>;
    signUp(input: PasswordSignUpInput): Promise<AuthOutcome>;
    /**
     * Sends a reset link opening `resetPath` (`/account/reset-password` by default); that page
     * reads the token with `readPasswordResetLink()` and calls `reset()`.
     */
    forgot(
      email: string,
      options?: { resetPath?: string }
    ): Promise<AuthOutcome>;
    /** Sets the new password of a reset link; the buyer then signs in with it. */
    reset(input: PasswordResetInput): Promise<AuthOutcome>;
  };
  emailVerification: {
    /**
     * Sends the verification email again; without an email, to the email of the step. The link
     * opens `verifyPath` (`/account/verify-email` by default); that page reads the outcome with
     * `readEmailVerificationLink()`.
     */
    resend(
      email?: string,
      options?: { verifyPath?: string }
    ): Promise<AuthOutcome>;
  };
  emailOtp: OtpActions;
  phoneOtp: OtpActions;
  social: {
    /** Leaves for the provider; the buyer returns to `returnTo` (the current page) signed in. */
    start(provider: string, options?: { returnTo?: string }): Promise<void>;
  };
  /** Back to the method forms, e.g. to change the email a code was sent to. */
  reset(): void;
  /** Reads the configuration again after it was `unavailable`. */
  reloadConfiguration(): void;
}

const IDLE: AuthFlowStep = { type: 'idle' };

/**
 * Everything a sign-in or sign-up form needs: enabled methods, the current step and the
 * actions. Actions never throw: they resolve to the step, or to the `AuthError` also set as
 * `error`, so they can be passed to `onSubmit` directly. The result is stable while nothing
 * of it changes.
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
    reload: reloadConfiguration,
  } = useAuthConfiguration();
  const [step, setStep] = useState<AuthFlowStep>(IDLE);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const destinations = useRef<{ email?: string; phone?: string }>({});

  // `resendIn` counts down to the deadline of the code waiting.
  const resendIn = useSecondsUntil(
    step.type === 'otpSent' ? step.resendAt : null
  );
  const currentStep = useMemo<AuthFlowStep>(
    () =>
      step.type === 'otpSent' && step.resendIn !== resendIn
        ? { ...step, resendIn }
        : step,
    [step, resendIn]
  );

  // A social sign-in leaves the page with the action still pending. Back from the provider,
  // the browser may restore this page from the back/forward cache with that state.
  useEffect(() => {
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) setIsPending(false);
    };
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, []);

  const fail = useCallback((failure: AuthError): AuthError => {
    setError(failure);
    return failure;
  }, []);

  const run = useCallback(
    async (
      action: () => Promise<AuthStep>,
      context: { email?: string; channel?: OtpChannel; destination?: string }
    ): Promise<AuthOutcome> => {
      setIsPending(true);
      setError(null);
      try {
        const result = await action();
        setStep(toFlowStep(result, context));
        return result;
      } catch (value) {
        const failure =
          value instanceof AuthError
            ? value
            : new AuthError('unavailable', String(value), 0);
        // An expired sign-in starts over from the method forms.
        if (failure.code === 'expired') setStep(IDLE);
        return fail(failure);
      } finally {
        setIsPending(false);
      }
    },
    [fail]
  );

  const otpActions = useCallback(
    (channel: OtpChannel): OtpActions => {
      const remembered = () => destinations.current[channel];
      const send = (destination?: string) => {
        const target = destination ?? remembered();
        if (!target) {
          return Promise.resolve(
            fail(
              new AuthError(
                'invalidInput',
                `No ${channel} to send a code to`,
                0
              )
            )
          );
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
    [client, run, fail]
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
      resend: (email?: string, options: { verifyPath?: string } = {}) => {
        const target = email ?? destinations.current.email;
        if (!target) {
          return Promise.resolve(
            fail(
              new AuthError(
                'invalidInput',
                'No email to send the verification to',
                0
              )
            )
          );
        }
        destinations.current.email = target;
        return run(
          () => client.resendVerificationEmail({ email: target, ...options }),
          { email: target }
        );
      },
    }),
    [client, run, fail]
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

  const shownError =
    error ?? (currentStep.type === 'idle' ? configurationError : null);

  return useMemo<UseAuthResult>(
    () => ({
      status: isLoading ? 'loading' : configuration ? 'ready' : 'unavailable',
      configuration,
      methods: configuration?.methods ?? null,
      step: currentStep,
      isPending,
      error: shownError,
      password,
      emailVerification,
      emailOtp,
      phoneOtp,
      social,
      reset,
      reloadConfiguration,
    }),
    [
      isLoading,
      configuration,
      currentStep,
      isPending,
      shownError,
      password,
      emailVerification,
      emailOtp,
      phoneOtp,
      social,
      reset,
      reloadConfiguration,
    ]
  );
}

function toFlowStep(
  result: AuthStep,
  context: { email?: string; channel?: OtpChannel; destination?: string }
): AuthFlowStep {
  switch (result.type) {
    case 'completed':
      return { type: 'completed' };
    case 'otpSent':
      return {
        type: 'otpSent',
        channel: result.channel,
        destination: context.destination ?? '',
        resendIn: result.resendAfter,
        resendAt: Date.now() + result.resendAfter * 1000,
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
