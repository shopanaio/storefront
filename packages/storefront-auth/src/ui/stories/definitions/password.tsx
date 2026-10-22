import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { PasswordScreen, type PasswordNotice } from '../../screens/PasswordScreen';
import type { AuthContext } from '../../screens/types';
import { EMAIL, errorOf, methodsOf } from '../fixtures';
import { Frame } from '../frames';

const STATES = [
  'default',
  'pending',
  'invalidInput',
  'invalidCredentials',
  'rateLimited',
  'verificationLink',
  'verificationResent',
  'signInRequired',
  'methodDisabled',
  'unavailable',
] as const;

interface Args {
  context: AuthContext;
  passwordSignUp: boolean;
  otp: boolean;
  passwordReset: boolean;
  state: (typeof STATES)[number];
}

const NOTICES: Partial<Record<Args['state'], PasswordNotice>> = {
  verificationLink: 'verificationLink',
  verificationResent: 'verificationResent',
  signInRequired: 'signInRequired',
};

const Story = (args: Args) => {
  const { state } = args;
  const [email, setEmail] = useState(state === 'invalidInput' ? 'olena@example' : EMAIL);
  const error =
    state === 'rateLimited'
      ? errorOf('rateLimited', 45)
      : state === 'invalidInput' ||
          state === 'invalidCredentials' ||
          state === 'methodDisabled' ||
          state === 'unavailable'
        ? errorOf(state)
        : null;
  return (
    <Frame context={args.context} back>
      <PasswordScreen
        key={state}
        context={args.context}
        methods={methodsOf({
          methods: args.otp ? 'both' : 'none',
          passwordSignUp: args.passwordSignUp,
          passwordReset: args.passwordReset,
        })}
        email={email}
        onEmailChange={setEmail}
        pending={state === 'pending'}
        error={error}
        notice={NOTICES[state] ?? null}
        defaultPassword="secret-password"
        onSubmit={fn()}
        onForgot={fn()}
        onCode={fn()}
        onSignUp={fn()}
        onResendVerification={fn()}
      />
    </Frame>
  );
};

/** Boards SdkSignIn, SdkCheckoutDrawerPassword (G2b) and SdkCheckoutRequiredPassword (A1b). */
export const password = {
  render: (args) => <Story {...args} />,
  args: {
    context: 'store',
    passwordSignUp: false,
    otp: true,
    passwordReset: true,
    state: 'default',
  },
  argTypes: {
    context: { control: 'inline-radio', options: ['store', 'checkoutGuest', 'checkoutRequired'] },
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as PasswordArgs };
