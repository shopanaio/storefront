'use client';

import { useCallback, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { isAuthError } from '../../core/AuthError';
import type { SignInScreen } from '../../core/types';
import {
  useAuth,
  useAuthResult,
  useSessionExpired,
  useUser,
  type AuthOutcome,
} from '../../react';
import { initialOf } from '../common/format';
import { useLoginIdentifier } from '../hooks/useLoginIdentifier';
import { useLocalizedAuthPaths } from '../hooks/useLocalizedAuthPaths';
import {
  draftOf,
  type AuthContext,
  type AuthDraft,
  type AuthDraftChange,
  type IdentifyNotice,
} from '../screens/types';
import {
  canGoBack,
  currentScreen,
  DEFAULT_CODE_LENGTH,
  flowReducer,
  initialFlow,
  reactToStep,
  screenOf,
  type FlowScreen,
  type FlowScreenName,
} from './navigation';
import type { AuthFlowScreenProps, AuthFlowView } from './screens';

export interface AuthFlowNavigation {
  canGoBack: boolean;
  back: () => void;
}

export interface AuthFlowOptions {
  /** Where the flow is shown; changes texts and what is offered. `store` by default. */
  context?: AuthContext;
  /** Email or phone the buyer already gave (the checkout contact); fills the first screen. */
  defaultIdentifier?: { email?: string | null; phone?: string | null };
  initialScreen?: SignInScreen;
  /** Signed in: the session hooks already see the buyer. */
  onCompleted?: () => void;
  /**
   * Runs before the browser leaves for a social provider, e.g. to save what the buyer typed;
   * the flow waits for it. A rejection keeps the buyer here, told the sign-in failed.
   */
  beforeSocial?: () => Promise<unknown> | void;
  /** Page of the email verification link; `/account/verify-email` of the active locale by default. */
  verifyPath?: string;
  /** Page of the password reset link; `/account/reset-password` of the active locale by default. */
  resetPath?: string;
  /** Page to return to from a social provider; the current page by default. */
  returnTo?: string;
  /** The line under the title of the first screen, in the host's words. */
  identifySubtitle?: ReactNode;
}

export interface UseAuthFlowResult {
  /** The screen shown and the props of its component. */
  view: AuthFlowView;
  navigation: AuthFlowNavigation;
  /** The identifier typed so far, shared by the screens. */
  draft: AuthDraft;
}

const RESULT_NOTICE = {
  cancelled: 'socialCancelled',
  failed: 'socialFailed',
  accountNotLinked: 'accountNotLinked',
} as const satisfies Record<string, IdentifyNotice>;

type ScreenOf<Name extends FlowScreenName> = Extract<
  FlowScreen,
  { name: Name }
>;

type PropsBuilders = {
  [Name in FlowScreenName]: (
    screen: ScreenOf<Name>
  ) => AuthFlowScreenProps[Name];
};

/**
 * The headless sign-in as a state machine over `useAuth()`: which screen is shown, the props of
 * its component and the way back. `AuthFlow` renders it; a host with screens of its own renders
 * `view` itself.
 */
export function useAuthFlow({
  context = 'store',
  defaultIdentifier,
  initialScreen = 'identify',
  onCompleted,
  beforeSocial,
  verifyPath: verifyPathOption,
  resetPath: resetPathOption,
  returnTo,
  identifySubtitle,
}: AuthFlowOptions = {}): UseAuthFlowResult {
  const { verifyPath, resetPath } = useLocalizedAuthPaths({
    verifyPath: verifyPathOption,
    resetPath: resetPathOption,
  });
  const auth = useAuth();
  const user = useUser();
  const login = useLoginIdentifier();
  const sessionExpired = useSessionExpired();
  const { result, clear: clearResult } = useAuthResult();
  const [flow, dispatch] = useReducer(flowReducer, initialScreen, initialFlow);
  const screen = currentScreen(flow);
  const [draft, setDraft] = useState(() => draftOf(defaultIdentifier));
  const [socialFailed, setSocialFailed] = useState(false);
  const completed = useRef(false);

  const complete = () => {
    if (completed.current) return;
    completed.current = true;
    dispatch({ type: 'open', screen: { name: 'signingIn' } });
    onCompleted?.();
  };

  /** What the flow does with the outcome of an action started on `origin`. */
  const handle = async (
    origin: FlowScreen,
    outcome: AuthOutcome
  ): Promise<void> => {
    if (isAuthError(outcome)) {
      // A spent or timed-out sign-in starts over on the first screen, its alert shown there.
      if (outcome.code === 'expired') dispatch({ type: 'restart' });
      return;
    }
    const reaction = reactToStep(origin, outcome);
    switch (reaction.type) {
      case 'open':
      case 'update':
        dispatch({ type: reaction.type, screen: reaction.screen });
        return;
      case 'completed':
        complete();
        return;
      case 'sendVerificationCode':
        // To the email of the password step that asked for it, kept by `useAuth`.
        return handle(origin, await auth.emailOtp.send());
      case 'none':
        return;
    }
  };

  const run = (action: () => Promise<AuthOutcome>) => {
    const origin = screen;
    clearResult();
    setSocialFailed(false);
    void action().then((outcome) => handle(origin, outcome));
  };

  /** Opens a screen by the buyer's choice: the last error and step are dropped. */
  const go = (name: SignInScreen) => {
    auth.reset();
    dispatch({ type: 'open', screen: screenOf(name) });
  };
  const { reset } = auth;
  const back = useCallback(() => {
    reset();
    dispatch({ type: 'back' });
  }, [reset]);

  const changeDraft: AuthDraftChange = (patch) => {
    // Another way to get a code drops the error of the last one.
    if (patch.channel && patch.channel !== draft.channel) auth.reset();
    setDraft((current) => ({ ...current, ...patch }));
  };

  const social = (provider: string) => {
    clearResult();
    setSocialFailed(false);
    void (async () => {
      try {
        await beforeSocial?.();
      } catch {
        setSocialFailed(true);
        dispatch({ type: 'open', screen: screenOf('identify') });
        return;
      }
      dispatch({ type: 'open', screen: { name: 'social', provider } });
      // Resolves only when the provider page could not be opened; the error is then shown.
      await auth.social.start(provider, { returnTo });
      dispatch({ type: 'back' });
    })();
  };

  const notice: IdentifyNotice | null = result
    ? RESULT_NOTICE[result as keyof typeof RESULT_NOTICE]
    : socialFailed
      ? 'socialFailed'
      : sessionExpired
        ? 'sessionExpired'
        : null;
  const otpStep = auth.step.type === 'otpSent' ? auth.step : null;
  const otpChannel =
    otpStep?.channel ??
    (screen.name === 'code' && screen.purpose === 'verifyEmail'
      ? 'email'
      : draft.channel);
  const otpMethod =
    otpChannel === 'email' ? auth.methods?.emailOtp : auth.methods?.phoneOtp;
  const otp = otpChannel === 'email' ? auth.emailOtp : auth.phoneOtp;
  const email = draft.email.trim();
  const common = { context, pending: auth.isPending, error: auth.error };

  const builders: PropsBuilders = {
    identify: () => ({
      ...common,
      status: auth.status,
      methods: auth.methods,
      draft,
      onDraftChange: changeDraft,
      notice,
      onSubmit: (channel, destination) =>
        run(() =>
          channel === 'email'
            ? auth.emailOtp.send(destination)
            : auth.phoneOtp.send(destination)
        ),
      onPassword: () => go('password'),
      onSocial: social,
      onRetry: auth.reloadConfiguration,
      subtitle: identifySubtitle,
    }),
    password: (current) => ({
      ...common,
      methods: auth.methods,
      draft,
      onDraftChange: changeDraft,
      notice: current.notice,
      onSubmit: (input) =>
        run(() => auth.password.signIn({ ...input, verifyPath })),
      onForgot: () => go('forgot'),
      onCode: () => go('identify'),
      onSignUp: () => go('signUp'),
      onResendVerification: () =>
        run(() => auth.emailVerification.resend(email, { verifyPath })),
    }),
    signUp: () => ({
      ...common,
      methods: auth.methods,
      draft,
      onDraftChange: changeDraft,
      onSubmit: (values) =>
        run(() =>
          auth.password.signUp({
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            verifyPath,
          })
        ),
      onSignIn: () => go('password'),
      onCode: () => go('identify'),
      onSocial: social,
    }),
    forgot: (current) => ({
      ...common,
      draft,
      onDraftChange: changeDraft,
      sent: current.sent,
      resent: current.resent,
      onSubmit: (target) =>
        run(() => auth.password.forgot(target, { resetPath })),
      onResend: () => run(() => auth.password.forgot(email, { resetPath })),
      onChangeEmail: () => {
        auth.reset();
        dispatch({ type: 'update', screen: screenOf('forgot') });
      },
      onBackToSignIn: () => go('password'),
    }),
    code: (current) => ({
      ...common,
      purpose: current.purpose,
      channel: otpChannel,
      destination:
        otpStep?.destination ??
        (otpChannel === 'email' ? email : (draft.phone ?? '')),
      codeLength: otpMethod?.codeLength ?? DEFAULT_CODE_LENGTH,
      resendIn: otpStep?.resendIn ?? 0,
      signUpWithCode: Boolean(otpMethod?.signUp),
      onVerify: (code) => run(() => otp.verify(code)),
      onResend: () => run(() => otp.resend()),
      onChange: back,
    }),
    verifyLink: (current) => ({
      ...common,
      email,
      sent: current.sent,
      onSignIn: () => go('password'),
      onResend: () =>
        run(() => auth.emailVerification.resend(email, { verifyPath })),
      onChangeEmail: back,
    }),
    social: (current) => ({ provider: current.provider }),
    signingIn: () => ({
      initial: initialOf(user),
      destination: login?.display ?? (user?.email || email || undefined),
    }),
  };

  return {
    view: viewOf(screen, builders),
    navigation: { canGoBack: canGoBack(flow), back },
    draft,
  };
}

function viewOf<Name extends FlowScreenName>(
  screen: ScreenOf<Name>,
  builders: PropsBuilders
): AuthFlowView {
  const build = builders[screen.name as Name] as (
    screen: ScreenOf<Name>
  ) => AuthFlowScreenProps[Name];
  return { name: screen.name, props: build(screen) } as AuthFlowView;
}
