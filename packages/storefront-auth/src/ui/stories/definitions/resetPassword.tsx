import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { errorOf } from '../../../testing';
import { ResetPasswordScreen } from '../../screens/ResetPasswordScreen';
import { errorForState } from '../args';
import { Frame } from '../frames';

const STATES = [
  'default',
  'pending',
  'passwordTooShort',
  'passwordTooLong',
  'linkInvalid',
  'rateLimited',
  'unavailable',
  'passwordReset',
  'linkExpired',
] as const;

interface Args {
  minLength: number;
  maxLength: number;
  state: (typeof STATES)[number];
}

const Story = (args: Args) => {
  const { state, minLength, maxLength } = args;
  const password =
    state === 'passwordTooShort'
      ? 'x'.repeat(Math.max(1, minLength - 4))
      : state === 'passwordTooLong'
        ? 'x'.repeat(maxLength + 2)
        : 'x'.repeat(minLength + 2);
  return (
    <Frame context="page" preset={{ password }}>
      <ResetPasswordScreen
        key={`${state}-${minLength}-${maxLength}`}
        context="store"
        state={
          state === 'passwordReset'
            ? 'done'
            : state === 'linkExpired'
              ? 'expired'
              : 'form'
        }
        minLength={minLength}
        maxLength={maxLength}
        pending={state === 'pending'}
        error={
          state === 'linkInvalid'
            ? errorOf('expired')
            : errorForState(state, ['unavailable'], { rateLimited: 300 })
        }
        onSubmit={fn()}
        onSignIn={fn()}
        onRequestNewLink={fn()}
      />
    </Frame>
  );
};

/**
 * Boards SdkResetPassword, SdkResetPasswordDone and SdkLinkExpired (passwordReset): the page of
 * a reset link, `/account/reset-password`.
 */
export const resetPassword = {
  render: (args) => <Story {...args} />,
  args: { minLength: 10, maxLength: 128, state: 'default' },
  argTypes: {
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as ResetPasswordArgs };
