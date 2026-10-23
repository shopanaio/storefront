import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SignUpScreen } from '../../screens/SignUpScreen';
import { EMAIL, errorOf, methodsOf } from '../fixtures';
import { Frame } from '../frames';

const STATES = [
  'default',
  'pending',
  'firstNameMissing',
  'lastNameMissing',
  'invalidInput',
  'passwordTooShort',
  'passwordTooLong',
  'userExists',
  'signUpDisabled',
  'rateLimited',
  'unavailable',
] as const;

interface Args {
  social: boolean;
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
  const error =
    state === 'rateLimited'
      ? errorOf('rateLimited', 252)
      : state === 'userExists' || state === 'signUpDisabled' || state === 'unavailable'
        ? errorOf(state)
        : null;
  return (
    <Frame context="store" back>
      <SignUpScreen
        key={`${state}-${minLength}-${maxLength}`}
        context="store"
        methods={methodsOf({ social: args.social, minLength, maxLength, passwordSignUp: true })}
        pending={state === 'pending'}
        error={error}
        showErrors={state !== 'default' && state !== 'pending'}
        defaultValues={{
          firstName: state === 'firstNameMissing' ? '' : 'Олена',
          lastName: state === 'lastNameMissing' ? '' : 'Коваленко',
          email: state === 'invalidInput' ? 'olena@example' : EMAIL,
          password,
        }}
        onSubmit={fn()}
        onSignIn={fn()}
        onCode={fn()}
        onSocial={fn()}
      />
    </Frame>
  );
};

/** Board SdkSignUp: a password account, the first and the last name required. */
export const signUp = {
  render: (args) => <Story {...args} />,
  args: { social: true, minLength: 10, maxLength: 128, state: 'default' },
  argTypes: {
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as SignUpArgs };
