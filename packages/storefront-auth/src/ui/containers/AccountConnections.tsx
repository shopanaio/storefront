'use client';

import { useState } from 'react';
import { useAccountConnections } from '../../react/useAccountConnections';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { AccountConnectionsView } from '../screens/AccountConnectionsView';

export interface AccountConnectionsProps {
  /** Signs the buyer in again: connections change only within 10 minutes of signing in. */
  onReauthenticate: () => void;
  /** Page to return to from the provider; the current page by default. */
  returnTo?: string;
}

/** Connected social accounts of the profile, over `useAccountConnections()`. */
export const AccountConnections = (props: AccountConnectionsProps) => (
  <AuthIntlProvider>
    <AccountConnectionsContent {...props} />
  </AuthIntlProvider>
);

const AccountConnectionsContent = ({ onReauthenticate, returnTo }: AccountConnectionsProps) => {
  const connections = useAccountConnections();
  const [provider, setProvider] = useState<string | null>(null);

  return (
    <AccountConnectionsView
      status={connections.status}
      connections={connections.connections}
      result={connections.result}
      pendingProvider={connections.isPending ? provider : null}
      error={connections.error}
      errorProvider={provider}
      onLink={(next) => {
        setProvider(next);
        void connections.link(next, { returnTo });
      }}
      onUnlink={(next) => {
        setProvider(next);
        void connections.unlink(next);
      }}
      onReload={() => void connections.reload()}
      onReauthenticate={onReauthenticate}
    />
  );
};
