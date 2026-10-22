import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EmailVerificationScreen } from '../../screens/EmailVerificationScreen';
import { EMAIL, errorOf } from '../fixtures';
import { Frame } from '../frames';

const STATES = ['verified', 'default', 'pending', 'rateLimited', 'verificationSent'] as const;

interface Args {
  state: (typeof STATES)[number];
}

const Story = (args: Args) => {
  const { state } = args;
  const [email, setEmail] = useState(state === 'verificationSent' ? EMAIL : '');
  return (
    <Frame context="page">
      <EmailVerificationScreen
        key={state}
        state={state === 'verified' ? 'verified' : 'expired'}
        email={email}
        onEmailChange={setEmail}
        sent={state === 'verificationSent'}
        pending={state === 'pending'}
        error={state === 'rateLimited' ? errorOf('rateLimited', 1800) : null}
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
