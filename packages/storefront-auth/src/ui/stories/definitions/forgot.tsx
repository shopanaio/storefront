import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EMAIL } from '../../../testing';
import { ForgotScreen } from '../../screens/ForgotScreen';
import { draftOf, type AuthContext, type AuthDraft } from '../../screens/types';
import { contextArgType, errorForState } from '../args';
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
  const [draft, setDraft] = useState<AuthDraft>(() =>
    draftOf({ email: state === 'invalidInput' ? 'olena@example' : EMAIL })
  );
  const sent =
    state === 'resetLinkSent' ||
    state === 'resendPending' ||
    state === 'resetLinkResent' ||
    state === 'resendRateLimited';
  const error = errorForState(state, ['invalidInput', 'unavailable'], {
    rateLimited: 600,
    resendRateLimited: 600,
  });
  return (
    <Frame context={args.context} back>
      <ForgotScreen
        key={state}
        context={args.context}
        draft={draft}
        onDraftChange={(patch) =>
          setDraft((current) => ({ ...current, ...patch }))
        }
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
    context: contextArgType,
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as ForgotArgs };
