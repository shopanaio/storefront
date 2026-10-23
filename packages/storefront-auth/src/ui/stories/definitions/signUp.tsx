import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EMAIL, methodsOf } from '../../../testing';
import { SignUpScreen } from '../../screens/SignUpScreen';
import { draftOf, type AuthDraft } from '../../screens/types';
import { errorForState } from '../args';
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
  const [draft, setDraft] = useState<AuthDraft>(() =>
    draftOf({ email: state === 'invalidInput' ? 'olena@example' : EMAIL })
  );
  const password =
    state === 'passwordTooShort'
      ? 'x'.repeat(Math.max(1, minLength - 4))
      : state === 'passwordTooLong'
        ? 'x'.repeat(maxLength + 2)
        : 'x'.repeat(minLength + 2);
  const error = errorForState(
    state,
    ['userExists', 'signUpDisabled', 'unavailable'],
    {
      rateLimited: 252,
    }
  );
  return (
    <Frame
      context="store"
      back
      preset={{
        submitted: state !== 'default' && state !== 'pending',
        firstName: state === 'firstNameMissing' ? '' : 'Олена',
        lastName: state === 'lastNameMissing' ? '' : 'Коваленко',
        password,
      }}
    >
      <SignUpScreen
        key={`${state}-${minLength}-${maxLength}`}
        context="store"
        methods={methodsOf({
          social: args.social,
          minLength,
          maxLength,
          passwordSignUp: true,
        })}
        draft={draft}
        onDraftChange={(patch) =>
          setDraft((current) => ({ ...current, ...patch }))
        }
        pending={state === 'pending'}
        error={error}
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
