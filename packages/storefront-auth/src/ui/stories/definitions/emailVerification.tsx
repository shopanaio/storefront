import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EMAIL } from '../../../testing';
import { EmailVerificationScreen } from '../../screens/EmailVerificationScreen';
import { draftOf, type AuthDraft } from '../../screens/types';
import { errorForState } from '../args';
import { Frame } from '../frames';

const STATES = [
  'verified',
  'default',
  'pending',
  'rateLimited',
  'verificationSent',
] as const;

interface Args {
  state: (typeof STATES)[number];
}

const Story = (args: Args) => {
  const { state } = args;
  const [draft, setDraft] = useState<AuthDraft>(() =>
    draftOf({ email: state === 'verificationSent' ? EMAIL : '' })
  );
  return (
    <Frame context="page">
      <EmailVerificationScreen
        key={state}
        context="store"
        state={state === 'verified' ? 'verified' : 'expired'}
        draft={draft}
        onDraftChange={(patch) =>
          setDraft((current) => ({ ...current, ...patch }))
        }
        sent={state === 'verificationSent'}
        pending={state === 'pending'}
        error={errorForState(state, [], { rateLimited: 1800 })}
        onResend={fn()}
        onSignIn={fn()}
      />
    </Frame>
  );
};

/**
 * Boards SdkEmailVerified and SdkLinkExpired (emailVerification): the page of a verification
 * link, `/account/verify-email`.
 */
export const emailVerification = {
  render: (args) => <Story {...args} />,
  args: { state: 'verified' },
  argTypes: {
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as EmailVerificationArgs };
