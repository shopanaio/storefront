'use client';

import { Button, Skeleton, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { AuthError } from '../../core/AuthError';
import type {
  AccountConnection,
  AccountConnections,
  ConnectionResult,
} from '../../core/types';
import { AuthAlert } from '../common/Screen';
import { socialProviderView } from '../parts/providers';
import { useAuthUI } from '../AuthUIProvider';

export interface AccountConnectionsViewProps {
  status: 'loading' | 'ready' | 'unavailable';
  connections: AccountConnections | null;
  /** Outcome of connecting a provider, read from the page the browser returned to. */
  result: ConnectionResult | null;
  /** Provider of the running action (connecting or disconnecting). */
  pendingProvider: string | null;
  /** Error of the last action and the provider it was about. */
  error: AuthError | null;
  errorProvider: string | null;
  onLink: (provider: string) => void;
  onUnlink: (provider: string) => void;
  onReload: () => void;
  /** Signs in again, so the connections can be changed. */
  onReauthenticate: () => void;
}

type Outcome = { type: 'info' | 'warning' | 'error'; key: string; provider: string };

function outcomeOf(
  result: ConnectionResult | null,
  error: AuthError | null,
  errorProvider: string | null,
  loaded: boolean
): Outcome | null {
  // An error while loading is the alert of the list, not of an action.
  if (error && errorProvider && loaded) {
    switch (error.code) {
      case 'lastLoginMethod':
        return { type: 'error', key: 'lastLoginMethod', provider: errorProvider };
      case 'accountConflict':
        return { type: 'error', key: 'accountConflict', provider: errorProvider };
      case 'linkingFailed':
      case 'unavailable':
        return { type: 'error', key: 'linkingFailed', provider: errorProvider };
      default:
        break;
    }
  }
  if (!result) return null;
  if (result.linked) return { type: 'info', key: 'linked', provider: result.provider };
  switch (result.error) {
    case 'accessDenied':
      return { type: 'warning', key: 'accessDenied', provider: result.provider };
    case 'emailMismatch':
      return { type: 'error', key: 'emailMismatch', provider: result.provider };
    case 'accountConflict':
      return { type: 'error', key: 'accountConflict', provider: result.provider };
    case 'reauthenticationRequired':
      return null;
    default:
      return { type: 'error', key: 'linkingFailed', provider: result.provider };
  }
}

/** Social accounts of the signed-in buyer in the profile: connect and disconnect them. */
export const AccountConnectionsView = ({
  status,
  connections,
  result,
  pendingProvider,
  error,
  errorProvider,
  onLink,
  onUnlink,
  onReload,
  onReauthenticate,
}: AccountConnectionsViewProps) => {
  const t = useTranslations('Auth.connections');
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const titlePart = part('title', styles.title);
  const reauth =
    Boolean(connections?.reauthenticationRequired) ||
    error?.code === 'reauthenticationRequired' ||
    (result !== null && !result.linked && result.error === 'reauthenticationRequired');
  const outcome = outcomeOf(result, error, errorProvider, status === 'ready');
  const busy = pendingProvider !== null;

  const row = (connection: AccountConnection) => {
    const view = socialProviderView(connection.provider);
    const pending = pendingProvider === connection.provider;
    const sub = !connection.enabled
      ? t('subDisabled')
      : connection.status === 'conflict'
        ? t('subConflict')
        : connection.status === 'connected'
          ? t('subConnected', { provider: view.name })
          : t('subNotConnected');
    return (
      <li key={connection.provider} className={styles.row}>
        <span className={styles.logo} aria-hidden="true">
          {view.icon}
        </span>
        <span className={styles.text}>
          <Typography.Text strong className={styles.name}>
            {view.name}
          </Typography.Text>
          <Typography.Text type="secondary">{sub}</Typography.Text>
        </span>
        {connection.status === 'connected' ? (
          <Tag color="success" bordered={false}>
            {t('connected')}
          </Tag>
        ) : null}
        {connection.status === 'conflict' ? (
          <Tag color="error" bordered={false}>
            {t('conflict')}
          </Tag>
        ) : null}
        {connection.status === 'notConnected' ? (
          <Button
            color="primary"
            variant="outlined"
            disabled={reauth || busy || !connection.enabled}
            aria-busy={pending || undefined}
            onClick={() => onLink(connection.provider)}
          >
            {pending ? t('pending') : t('connect')}
          </Button>
        ) : (
          <Button
            disabled={reauth || busy}
            aria-busy={pending || undefined}
            onClick={() => onUnlink(connection.provider)}
          >
            {pending ? t('pending') : t('disconnect')}
          </Button>
        )}
      </li>
    );
  };

  return (
    <section className={styles.root} aria-labelledby="auth-connections-title">
      <div className={styles.head}>
        <Typography.Title
          level={2}
          id="auth-connections-title"
          className={titlePart.className}
          style={titlePart.style}
        >
          {t('title')}
        </Typography.Title>
        <Typography.Text type="secondary">{t('subtitle')}</Typography.Text>
      </div>
      {outcome ? (
        <AuthAlert type={outcome.type}>
          {t(outcome.key, { provider: socialProviderView(outcome.provider).name })}
        </AuthAlert>
      ) : null}
      {reauth ? (
        <AuthAlert
          type="warning"
          action={{ label: t('reauthenticateAction'), onClick: onReauthenticate }}
        >
          {t('reauthenticate')}
        </AuthAlert>
      ) : null}
      {status === 'unavailable' ? (
        <AuthAlert
          type="error"
          action={{ label: t('retry'), onClick: onReload }}
        >
          {t('unavailable')}
        </AuthAlert>
      ) : null}
      {status === 'loading' ? (
        <div aria-busy="true" aria-label={t('loading')} className={styles.skeletons}>
          <Skeleton.Button active block size="large" />
          <Skeleton.Button active block size="large" />
        </div>
      ) : null}
      {status === 'ready' && connections ? (
        <>
          <ul className={styles.list}>{connections.providers.map(row)}</ul>
          <Typography.Text type="secondary" className={styles.note}>
            {t('footNote')}
          </Typography.Text>
        </>
      ) : null}
    </section>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG}px;
  `,
  head: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  title: css`
    && {
      margin: 0;
      font-size: ${token.fontSizeHeading3}px;
      line-height: ${token.lineHeightHeading3};
    }
  `,
  list: css`
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
  `,
  row: css`
    display: flex;
    align-items: center;
    gap: ${token.paddingSM}px;
    padding: ${token.padding}px ${token.paddingLG - 4}px;

    & + & {
      border-top: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    }
  `,
  logo: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 40px;
    height: 40px;
    border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    border-radius: 50%;
    font-size: ${token.fontSizeXL}px;
  `,
  text: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  `,
  name: css`
    font-size: ${token.fontSizeLG}px;
  `,
  skeletons: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
  `,
}));
