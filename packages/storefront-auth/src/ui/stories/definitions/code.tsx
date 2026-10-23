import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { EMAIL, PHONE, errorOf } from '../../../testing';
import { CodeScreen } from '../../screens/CodeScreen';
import { SigningInScreen } from '../../screens/SigningInScreen';
import type { AuthContext, OtpPurpose } from '../../screens/types';
import { contextArgType, errorForState } from '../args';
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
  const destination = channel === 'email' ? EMAIL : PHONE;
  if (state === 'signingIn') {
    return (
      <Frame context={args.context}>
        <SigningInScreen initial="О" destination={destination} />
      </Frame>
    );
  }
  const error =
    state === 'invalidCode'
      ? errorOf('invalidCredentials')
      : errorForState(state, ['deliveryUnavailable', 'unavailable'], {
          rateLimited: 570,
        });
  // A wrong code is cleared for the next one.
  const code =
    state === 'typing' ? '48190' : state === 'verifying' ? '481907' : '';
  return (
    <Frame context={args.context} back preset={{ code }}>
      <CodeScreen
        key={state}
        context={args.context}
        purpose={args.purpose}
        channel={channel}
        destination={destination}
        codeLength={6}
        resendIn={RESEND_IN[state] ?? 0}
        signUpWithCode={args.otpSignUp}
        pending={state === 'verifying'}
        error={error}
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
    context: contextArgType,
    purpose: { control: 'inline-radio', options: ['signIn', 'verifyEmail'] },
    channel: { control: 'inline-radio', options: ['email', 'phone'] },
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as CodeArgs };
