import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import {
  EMAIL,
  PHONE,
  errorOf,
  methodsOf,
  type MethodsArg,
} from '../../../testing';
import type { AuthMethodTab } from '../../AuthUIProvider';
import { IdentifyScreen } from '../../screens/IdentifyScreen';
import type {
  AuthContext,
  AuthDraft,
  IdentifyNotice,
} from '../../screens/types';
import { contextArgType, errorForState } from '../args';
import { Frame } from '../frames';
const STATES = [
  'default',
  'loading',
  'countryPicker',
  'pending',
  'invalidInput',
  'rateLimited',
  'deliveryUnavailable',
  'methodDisabled',
  'expired',
  'socialCancelled',
  'socialFailed',
  'accountNotLinked',
  'sessionExpired',
  'unavailable',
  'accountsDisabled',
] as const;

interface Args {
  context: AuthContext;
  methods: MethodsArg;
  channel: AuthMethodTab;
  passwordSignIn: boolean;
  passwordSignUp: boolean;
  social: boolean;
  state: (typeof STATES)[number];
}

const NOTICES: Partial<Record<Args['state'], IdentifyNotice>> = {
  socialCancelled: 'socialCancelled',
  socialFailed: 'socialFailed',
  accountNotLinked: 'accountNotLinked',
  sessionExpired: 'sessionExpired',
};

const Story = (args: Args) => {
  const { state } = args;
  const invalid = state === 'invalidInput';
  const [draft, setDraft] = useState<AuthDraft>({
    channel: args.channel,
    phone: invalid ? '+3806712345' : PHONE,
    email: invalid ? 'olena@example' : EMAIL,
  });
  const error =
    state === 'accountsDisabled'
      ? errorOf('disabled')
      : errorForState(
          state,
          [
            'invalidInput',
            'deliveryUnavailable',
            'methodDisabled',
            'expired',
            'unavailable',
          ],
          { rateLimited: 720 }
        );
  return (
    <Frame
      context={args.context}
      preset={{
        countryPickerOpen: state === 'countryPicker' ? true : undefined,
      }}
    >
      <IdentifyScreen
        key={`${state}-${args.channel}`}
        context={args.context}
        status={
          state === 'loading'
            ? 'loading'
            : state === 'accountsDisabled'
              ? 'unavailable'
              : 'ready'
        }
        methods={
          state === 'loading' || state === 'accountsDisabled'
            ? null
            : methodsOf({
                methods: args.methods,
                passwordSignIn: args.passwordSignIn,
                passwordSignUp: args.passwordSignUp,
                social: args.social,
              })
        }
        draft={draft}
        onDraftChange={(patch) =>
          setDraft((current) => ({ ...current, ...patch }))
        }
        pending={state === 'pending'}
        error={error}
        notice={NOTICES[state] ?? null}
        onSubmit={fn()}
        onPassword={fn()}
        onSocial={fn()}
        onRetry={fn()}
      />
    </Frame>
  );
};

/**
 * Boards SdkMain (store), SdkCheckoutDrawerIdentify (G2), SdkCheckoutRequiredIdentify and
 * SdkCheckoutRequiredMobile (A1): the first screen of the sign-in.
 */
export const identify = {
  render: (args) => <Story {...args} />,
  args: {
    context: 'store',
    methods: 'both',
    channel: 'phone',
    passwordSignIn: true,
    passwordSignUp: false,
    social: true,
    state: 'default',
  },
  argTypes: {
    context: contextArgType,
    methods: {
      control: 'inline-radio',
      options: ['both', 'phone', 'email', 'none'],
    },
    channel: { control: 'inline-radio', options: ['phone', 'email'] },
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as IdentifyArgs };
