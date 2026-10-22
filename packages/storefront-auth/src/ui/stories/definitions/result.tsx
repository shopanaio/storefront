import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SocialRedirectScreen, VerifyEmailLinkScreen } from '../../screens/ResultScreen';
import { EMAIL, errorOf } from '../fixtures';
import { Frame } from '../frames';

const STATES = ['default', 'pending', 'verificationSent', 'rateLimited', 'unavailable'] as const;

interface Args {
  board: 'verifyEmailLink' | 'socialRedirect';
  provider: 'google' | 'facebook';
  state: (typeof STATES)[number];
}

const Story = (args: Args) => {
  if (args.board === 'socialRedirect') {
    return (
      <Frame context="page">
        <SocialRedirectScreen provider={args.provider} />
      </Frame>
    );
  }
  const { state } = args;
  return (
    <Frame context="page">
      <VerifyEmailLinkScreen
        email={EMAIL}
        sent={state === 'verificationSent'}
        pending={state === 'pending'}
        error={
          state === 'rateLimited'
            ? errorOf('rateLimited', 1800)
            : state === 'unavailable'
              ? errorOf('unavailable')
              : null
        }
        onSignIn={fn()}
        onResend={fn()}
        onChangeEmail={fn()}
      />
    </Frame>
  );
};

/** Boards SdkVerifyEmailLink and SdkSocialRedirect. */
export const result = {
  render: (args) => <Story {...args} />,
  args: { board: 'verifyEmailLink', provider: 'google', state: 'default' },
  argTypes: {
    board: { control: 'inline-radio', options: ['verifyEmailLink', 'socialRedirect'] },
    provider: { control: 'inline-radio', options: ['google', 'facebook'] },
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as ResultArgs };
