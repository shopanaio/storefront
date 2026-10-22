import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { ForgotScreen } from '../../screens/ForgotScreen';
import type { AuthContext } from '../../screens/types';
import { EMAIL, errorOf } from '../fixtures';
import { Frame } from '../frames';

const STATES = [
  'default',
  'pending',
  'invalidInput',
  'rateLimited',
  'unavailable',
  'resetLinkSent',
  'resendPending',
  'resetLinkResent',
  'resendRateLimited',
] as const;

interface Args {
  context: AuthContext;
  state: (typeof STATES)[number];
}

const Story = (args: Args) => {
  const { state } = args;
  const [email, setEmail] = useState(state === 'invalidInput' ? 'olena@example' : EMAIL);
  const sent =
    state === 'resetLinkSent' ||
    state === 'resendPending' ||
    state === 'resetLinkResent' ||
    state === 'resendRateLimited';
  const error =
    state === 'rateLimited' || state === 'resendRateLimited'
      ? errorOf('rateLimited', 600)
      : state === 'invalidInput' || state === 'unavailable'
        ? errorOf(state)
        : null;
  return (
    <Frame context={args.context} back>
      <ForgotScreen
        key={state}
        context={args.context}
        email={email}
        onEmailChange={setEmail}
        sent={sent}
        resent={state === 'resetLinkResent'}
        pending={state === 'pending' || state === 'resendPending'}
        error={error}
        onSubmit={fn()}
        onResend={fn()}
        onChangeEmail={fn()}
        onBackToSignIn={fn()}
      />
    </Frame>
  );
};

/**
 * Boards SdkForgotPassword, SdkForgotPasswordSent, SdkCheckoutDrawerForgot (G2c) and
 * SdkCheckoutRequiredForgot (A1c).
 */
export const forgot = {
  render: (args) => <Story {...args} />,
  args: { context: 'store', state: 'default' },
  argTypes: {
    context: { control: 'inline-radio', options: ['store', 'checkoutGuest', 'checkoutRequired'] },
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as ForgotArgs };
