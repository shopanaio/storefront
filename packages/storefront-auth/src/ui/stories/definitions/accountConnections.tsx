import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { AccountConnections, ConnectionResult } from '../../../core/types';
import { AccountConnectionsView } from '../../screens/AccountConnectionsView';
import { errorForState } from '../args';
import { Frame } from '../frames';

const STATES = [
  'default',
  'loading',
  'pending',
  'reauthenticationRequired',
  'conflict',
  'providerDisabled',
  'linked',
  'accessDenied',
  'emailMismatch',
  'accountConflict',
  'lastLoginMethod',
  'linkingFailed',
  'unavailable',
] as const;

interface Args {
  state: (typeof STATES)[number];
}

function connectionsOf(state: Args['state']): AccountConnections {
  const facebook =
    state === 'linked' || state === 'providerDisabled'
      ? 'connected'
      : state === 'conflict'
        ? 'conflict'
        : 'notConnected';
  return {
    reauthenticationRequired: state === 'reauthenticationRequired',
    providers: [
      { provider: 'google', enabled: true, status: 'connected' },
      {
        provider: 'facebook',
        enabled: state !== 'providerDisabled',
        status: facebook,
      },
    ],
  };
}

function resultOf(state: Args['state']): ConnectionResult | null {
  switch (state) {
    case 'linked':
      return { provider: 'facebook', linked: true };
    case 'accessDenied':
    case 'emailMismatch':
    case 'accountConflict':
      return { provider: 'facebook', linked: false, error: state };
    default:
      return null;
  }
}

const Story = ({ state }: Args) => (
  <Frame context="profile">
    <AccountConnectionsView
      status={
        state === 'loading'
          ? 'loading'
          : state === 'unavailable'
            ? 'unavailable'
            : 'ready'
      }
      connections={
        state === 'loading' || state === 'unavailable'
          ? null
          : connectionsOf(state)
      }
      result={resultOf(state)}
      pendingProvider={state === 'pending' ? 'facebook' : null}
      error={errorForState(state, [
        'lastLoginMethod',
        'linkingFailed',
        'unavailable',
      ])}
      errorProvider={state === 'lastLoginMethod' ? 'google' : 'facebook'}
      onLink={fn()}
      onUnlink={fn()}
      onReload={fn()}
      onReauthenticate={fn()}
    />
  </Frame>
);

/** Board SdkAccountConnections: social accounts in the profile (`useAccountConnections`). */
export const accountConnections = {
  render: (args) => <Story {...args} />,
  args: { state: 'default' },
  argTypes: {
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<Args>;

export type { Args as AccountConnectionsArgs };
