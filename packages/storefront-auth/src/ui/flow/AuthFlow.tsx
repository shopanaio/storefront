'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  useAuthResult,
  useSessionExpired,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';
import type { AuthStep } from '../../core/types';
import { useAuth } from '../../react/useAuth';
import type { AuthMethodTab } from '../AuthUIProvider';
import { initialOf } from '../common/format';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { CodeScreen } from '../screens/CodeScreen';
import { ForgotScreen } from '../screens/ForgotScreen';
import { IdentifyScreen } from '../screens/IdentifyScreen';
import { PasswordScreen } from '../screens/PasswordScreen';
import { SocialRedirectScreen, VerifyEmailLinkScreen } from '../screens/ResultScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import type { AuthContext, IdentifyNotice } from '../screens/types';
import {
  canGoBack,
  currentScreen,
  flowReducer,
  initialFlow,
  reactToStep,
  screenOf,
  type FlowScreen,
  type InitialScreen,
} from './navigation';

export interface AuthFlowNavigation {
  canGoBack: boolean;
  back: () => void;
}

export interface AuthFlowProps {
  /** Where the flow is shown; changes texts and what is offered. `store` by default. */
  context?: AuthContext;
  /** Email or phone the buyer already gave (the checkout contact); fills the first screen. */
  defaultIdentifier?: { email?: string | null; phone?: string | null };
  initialScreen?: InitialScreen;
  /** Signed in: the session hooks already see the buyer. */
  onCompleted?: () => void;
  /**
   * Runs before the browser leaves for a social provider, e.g. to save what the buyer typed;
   * the flow waits for it.
   */
  beforeSocial?: () => Promise<unknown> | void;
  /** Page of the email verification link; `/account/verify-email` by default. */
  verifyPath?: string;
  /** Page of the password reset link; `/account/reset-password` by default. */
  resetPath?: string;
  /** Page to return to from a social provider; the current page by default. */
  returnTo?: string;
  /** Header of the container (back, close, logo), given the navigation of the flow. */
  renderHeader?: (navigation: AuthFlowNavigation) => ReactNode;
}

const RESULT_NOTICE = {
  cancelled: 'socialCancelled',
  failed: 'socialFailed',
  accountNotLinked: 'accountNotLinked',
} as const satisfies Record<string, IdentifyNotice>;

/**
 * The whole headless sign-in in one component: it picks the screen over `useAuth().step` and
 * its own navigation, the same in a dialog, a drawer and inline. Behavior comes from the SDK;
 * the screens only render it.
 */
export function AuthFlow(props: AuthFlowProps) {
  return (
    <AuthIntlProvider>
      <AuthFlowScreens {...props} />
    </AuthIntlProvider>
  );
}

function AuthFlowScreens({
  context = 'store',
  defaultIdentifier,
  initialScreen = 'identify',
  onCompleted,
  beforeSocial,
  verifyPath,
  resetPath,
  returnTo,
  renderHeader,
}: AuthFlowProps) {
  const auth = useAuth();
  const user = useUser();
  const sessionExpired = useSessionExpired();
  const { result, clear: clearResult } = useAuthResult();
  const [flow, dispatch] = useReducer(flowReducer, initialScreen, initialFlow);
  const screen = currentScreen(flow);
  const [channel, setChannel] = useState<AuthMethodTab>(
    defaultIdentifier?.email && !defaultIdentifier.phone ? 'email' : 'phone'
  );
  const [phone, setPhone] = useState<string | undefined>(defaultIdentifier?.phone ?? undefined);
  const [email, setEmail] = useState(defaultIdentifier?.email ?? '');
  const completed = useRef(false);

  // A spent or timed-out sign-in starts over on the first screen, its alert shown there.
  useEffect(() => {
    if (auth.error?.code === 'expired') dispatch({ type: 'restart' });
  }, [auth.error]);

  const complete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    dispatch({ type: 'open', screen: { name: 'signingIn' } });
    onCompleted?.();
  }, [onCompleted]);

  const handle = useCallback(
    async (origin: FlowScreen, step: AuthStep | null) => {
      if (!step) return;
      const reaction = reactToStep(origin, step);
      switch (reaction.type) {
        case 'open':
        case 'update':
          dispatch({ type: reaction.type, screen: reaction.screen });
          return;
        case 'completed':
          complete();
          return;
        case 'sendVerificationCode': {
          const sent = await auth.emailOtp.send(email.trim());
          if (sent?.type === 'otpSent')
            dispatch({ type: 'open', screen: { name: 'code', purpose: 'verifyEmail' } });
          return;
        }
        case 'none':
          return;
      }
    },
    [auth.emailOtp, complete, email]
  );

  const run = (action: () => Promise<AuthStep | null>) => {
    const origin = screen;
    clearResult();
    void action().then((step) => handle(origin, step));
  };

  /** Opens a screen by the buyer's choice: the last error and step are dropped. */
  const go = (next: FlowScreen) => {
    auth.reset();
    dispatch({ type: 'open', screen: next });
  };
  const back = () => {
    auth.reset();
    dispatch({ type: 'back' });
  };

  const social = (provider: string) => {
    clearResult();
    void (async () => {
      await beforeSocial?.();
      dispatch({ type: 'open', screen: { name: 'social', provider } });
      // Resolves only when the provider page could not be opened; the error is then shown.
      await auth.social.start(provider, { returnTo });
      dispatch({ type: 'back' });
    })();
  };

  const notice: IdentifyNotice | null = result
    ? RESULT_NOTICE[result]
    : sessionExpired
      ? 'sessionExpired'
      : null;
  const otpStep = auth.step.type === 'otpSent' ? auth.step : null;
  const otpChannel = otpStep?.channel ?? (screen.name === 'code' && screen.purpose === 'verifyEmail' ? 'email' : channel);
  const otpMethod = otpChannel === 'email' ? auth.methods?.emailOtp : auth.methods?.phoneOtp;

  const body = (() => {
    switch (screen.name) {
      case 'identify':
        return (
          <IdentifyScreen
            context={context}
            status={auth.status}
            methods={auth.methods}
            channel={channel}
            onChannelChange={(next) => {
              auth.reset();
              setChannel(next);
            }}
            phone={phone}
            onPhoneChange={setPhone}
            email={email}
            onEmailChange={setEmail}
            pending={auth.isPending}
            error={auth.error}
            notice={notice}
            onSubmit={(target, destination) =>
              run(() =>
                target === 'email'
                  ? auth.emailOtp.send(destination)
                  : auth.phoneOtp.send(destination)
              )
            }
            onPassword={() => go(screenOf('password'))}
            onSignUp={() => go(screenOf('signUp'))}
            onSocial={social}
          />
        );
      case 'password':
        return (
          <PasswordScreen
            context={context}
            methods={auth.methods}
            email={email}
            onEmailChange={setEmail}
            pending={auth.isPending}
            error={auth.error}
            notice={screen.notice}
            onSubmit={(input) =>
              run(() => auth.password.signIn({ ...input, verifyPath }))
            }
            onForgot={() => go(screenOf('forgot'))}
            onCode={() => go(screenOf('identify'))}
            onSignUp={() => go(screenOf('signUp'))}
            onResendVerification={() =>
              run(() => auth.emailVerification.resend(email.trim(), { verifyPath }))
            }
          />
        );
      case 'signUp':
        return (
          <SignUpScreen
            context={context}
            methods={auth.methods}
            pending={auth.isPending}
            error={auth.error}
            defaultValues={{ email }}
            onSubmit={(values) => {
              setEmail(values.email);
              run(() =>
                auth.password.signUp({
                  email: values.email,
                  password: values.password,
                  firstName: values.firstName,
                  lastName: values.lastName || undefined,
                  verifyPath,
                })
              );
            }}
            onSignIn={() => go(screenOf('password'))}
            onCode={() => go(screenOf('identify'))}
            onSocial={social}
          />
        );
      case 'forgot':
        return (
          <ForgotScreen
            context={context}
            email={email}
            onEmailChange={setEmail}
            sent={screen.sent}
            resent={screen.resent}
            pending={auth.isPending}
            error={auth.error}
            onSubmit={(target) => run(() => auth.password.forgot(target, { resetPath }))}
            onResend={() => run(() => auth.password.forgot(email.trim(), { resetPath }))}
            onChangeEmail={() => {
              auth.reset();
              dispatch({ type: 'update', screen: screenOf('forgot') });
            }}
            onBackToSignIn={() => go(screenOf('password'))}
          />
        );
      case 'code':
        return (
          <CodeScreen
            purpose={screen.purpose}
            channel={otpChannel}
            destination={
              otpStep?.destination ?? (otpChannel === 'email' ? email : (phone ?? ''))
            }
            codeLength={otpMethod?.codeLength ?? 6}
            resendIn={otpStep?.resendIn ?? 0}
            signUpWithCode={Boolean(otpMethod?.signUp)}
            pending={auth.isPending}
            error={auth.error}
            onVerify={(code) =>
              run(() =>
                otpChannel === 'email'
                  ? auth.emailOtp.verify(code)
                  : auth.phoneOtp.verify(code)
              )
            }
            onResend={() =>
              run(() =>
                otpChannel === 'email' ? auth.emailOtp.resend() : auth.phoneOtp.resend()
              )
            }
            onChange={back}
          />
        );
      case 'verifyLink':
        return (
          <VerifyEmailLinkScreen
            email={email.trim()}
            sent={screen.sent}
            pending={auth.isPending}
            error={auth.error}
            onSignIn={() => go(screenOf('password'))}
            onResend={() =>
              run(() => auth.emailVerification.resend(email.trim(), { verifyPath }))
            }
            onChangeEmail={back}
          />
        );
      case 'social':
        return <SocialRedirectScreen provider={screen.provider} />;
      case 'signingIn':
        return (
          <CodeScreen
            purpose="signIn"
            channel={otpChannel}
            destination={otpStep?.destination ?? (user?.email || email)}
            codeLength={6}
            resendIn={0}
            signUpWithCode
            pending={false}
            error={null}
            signingIn={{ initial: initialOf(user) }}
            onVerify={() => undefined}
            onResend={() => undefined}
            onChange={() => undefined}
          />
        );
    }
  })();

  return (
    <>
      {renderHeader?.({ canGoBack: canGoBack(flow), back })}
      {body}
    </>
  );
}
