import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CodeScreen } from '../../screens/CodeScreen';
import type { AuthContext, OtpPurpose } from '../../screens/types';
import { EMAIL, PHONE, errorOf } from '../fixtures';
import { Frame } from '../frames';

const STATES = [
  'typing',
  'verifying',
  'invalidCode',
  'resendAvailable',
  'deliveryUnavailable',
  'rateLimited',
  'unavailable',
  'signingIn',
] as const;

interface Args {
  context: AuthContext;
  purpose: OtpPurpose;
  channel: 'email' | 'phone';
  otpSignUp: boolean;
  state: (typeof STATES)[number];
}

const RESEND_IN: Partial<Record<Args['state'], number>> = {
  typing: 42,
  verifying: 41,
  invalidCode: 18,
};

const Story = (args: Args) => {
  const { state } = args;
  const channel = args.purpose === 'verifyEmail' ? 'email' : args.channel;
  const error =
    state === 'invalidCode'
      ? errorOf('invalidCredentials')
      : state === 'rateLimited'
        ? errorOf('rateLimited', 570)
        : state === 'deliveryUnavailable' || state === 'unavailable'
          ? errorOf(state)
          : null;
  return (
    <Frame context={args.context} back>
      <CodeScreen
        key={state}
        purpose={args.purpose}
        channel={channel}
        destination={channel === 'email' ? EMAIL : PHONE}
        codeLength={6}
        resendIn={RESEND_IN[state] ?? 0}
        signUpWithCode={args.otpSignUp}
        pending={state === 'verifying'}
        error={error}
        signingIn={state === 'signingIn' ? { initial: 'О' } : null}
        defaultCode={
          state === 'typing'
            ? '48190'
            : state === 'verifying' || state === 'invalidCode'
              ? '481907'
              : ''
        }
        onVerify={fn()}
        onResend={fn()}
        onChange={fn()}
      />
    </Frame>
  );
};

/**
 * Boards SdkOtpCode, SdkVerifyEmailCode, SdkCheckoutDrawerCode (G3), SdkCheckoutDrawerMobile and
 * SdkCheckoutRequiredCode (A2). The code is always 6 digits (IAM).
 */
export const code = {
  render: (args) => <Story {...args} />,
  args: {
    context: 'store',
    purpose: 'signIn',
    channel: 'email',
    otpSignUp: true,
    state: 'typing',
  },
  argTypes: {
    context: { control: 'inline-radio', options: ['store', 'checkoutGuest', 'checkoutRequired'] },
    purpose: { control: 'inline-radio', options: ['signIn', 'verifyEmail'] },
    channel: { control: 'inline-radio', options: ['email', 'phone'] },
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as CodeArgs };
