import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EMAIL, methodsOf } from '../../../testing';
import { PasswordScreen } from '../../screens/PasswordScreen';
import {
  draftOf,
  type AuthContext,
  type AuthDraft,
  type PasswordNotice,
} from '../../screens/types';
import { contextArgType, errorForState } from '../args';
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
  const [draft, setDraft] = useState<AuthDraft>(() =>
    draftOf({ email: state === 'invalidInput' ? 'olena@example' : EMAIL })
  );
  const error = errorForState(
    state,
    ['invalidInput', 'invalidCredentials', 'methodDisabled', 'unavailable'],
    { rateLimited: 45 }
  );
  return (
    <Frame context={args.context} back preset={{ password: 'secret-password' }}>
      <PasswordScreen
        key={state}
        context={args.context}
        methods={methodsOf({
          methods: args.otp ? 'both' : 'none',
          passwordSignUp: args.passwordSignUp,
          passwordReset: args.passwordReset,
        })}
        draft={draft}
        onDraftChange={(patch) =>
          setDraft((current) => ({ ...current, ...patch }))
        }
        pending={state === 'pending'}
        error={error}
        notice={NOTICES[state] ?? null}
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
    context: contextArgType,
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as PasswordArgs };
