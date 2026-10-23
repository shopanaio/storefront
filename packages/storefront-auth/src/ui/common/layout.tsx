'use client';

import { Button, Typography } from 'antd';
import { createStyles } from 'antd-style';
import type { CSSProperties, ReactNode } from 'react';
import { useAuthUI } from '../AuthUIProvider';
import { useHeadingSlot } from './heading';

/** Size of the round media over a title: the badge, a provider logo, the buyer's initial. */
export const MEDIA_SIZE = 56;

/** One centered column of a screen: the layout every sign-in screen shares. */
export const Screen = ({
  children,
  busy,
}: {
  children: ReactNode;
  /** The screen only reports progress ("Signing in…"): announced politely. */
  busy?: boolean;
}) => {
  const { styles, cx } = useStyles();
  const { part } = useAuthUI();
  // In a container with a header of its own (the checkout drawer) the screen is its content,
  // as wide as the other drawer content, with the drawer's own padding only.
  const embedded = Boolean(useHeadingSlot());
  const root = part('root', cx(styles.root, embedded && styles.embedded));
  return (
    <div
      className={root.className}
      style={root.style}
      role={busy ? 'status' : undefined}
      aria-live={busy ? 'polite' : undefined}
    >
      {children}
    </div>
  );
};

/** Round badge with the icon of the step (an envelope, a phone, a check). */
export const Badge = ({
  icon,
  tone = 'info',
}: {
  icon: ReactNode;
  tone?: 'info' | 'success' | 'warning';
}) => {
  const { styles, cx } = useStyles();
  const { part } = useAuthUI();
  const badge = part(
    'badge',
    cx(
      styles.media,
      styles.badge,
      tone === 'success' && styles.badgeSuccess,
      tone === 'warning' && styles.badgeWarning
    )
  );
  return (
    <span className={badge.className} style={badge.style} aria-hidden="true">
      {icon}
    </span>
  );
};

/** A round frame of `MEDIA_SIZE` for a provider logo or the buyer's initial. */
export const MediaCircle = ({
  children,
  outlined,
  className,
}: {
  children: ReactNode;
  /** A border on the container color (a provider logo); the primary tint otherwise. */
  outlined?: boolean;
  className?: string;
}) => {
  const { styles, cx } = useStyles();
  return (
    <span
      className={cx(
        styles.media,
        outlined ? styles.outlined : styles.badge,
        className
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
};

/** Where the code or the link went, with its change action. */
export const Chip = ({
  value,
  action,
}: {
  value: ReactNode;
  action?: { label: ReactNode; ariaLabel?: string; onClick: () => void };
}) => {
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const chip = part('chip', styles.chip);
  return (
    <span className={chip.className} style={chip.style}>
      <span className={styles.chipValue}>{value}</span>
      {action ? (
        <Button
          size="small"
          variant="link"
          color="primary"
          aria-label={action.ariaLabel}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ) : null}
    </span>
  );
};

/** The `footer` part: the line at the end of a store card ("Want a password? Sign up"). */
export const Footer = ({ children }: { children: ReactNode }) => {
  const { styles } = useStyles();
  const { part } = useAuthUI();
  const footer = part('footer', styles.footer);
  return (
    <Typography.Text
      type="secondary"
      className={footer.className}
      style={footer.style}
    >
      {children}
    </Typography.Text>
  );
};

/** A column of full-width controls. */
export const Stack = ({
  children,
  gap,
  style,
}: {
  children: ReactNode;
  gap?: 'small' | 'middle';
  style?: CSSProperties;
}) => {
  const { styles, cx } = useStyles();
  return (
    <div
      className={cx(styles.stack, gap === 'middle' && styles.stackMiddle)}
      style={style}
    >
      {children}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${token.padding}px;
    width: 100%;
    max-width: 380px;
    margin: 0 auto;
    text-align: center;
  `,
  // Room under the last control, so it does not sit on the bottom edge of the drawer.
  embedded: css`
    max-width: none;
    padding-bottom: ${token.paddingLG}px;
  `,
  media: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: ${MEDIA_SIZE}px;
    height: ${MEDIA_SIZE}px;
    border-radius: 50%;
    font-size: ${token.fontSizeHeading3}px;
  `,
  badge: css`
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
  `,
  badgeSuccess: css`
    background: ${token.colorSuccessBg};
    color: ${token.colorSuccess};
  `,
  badgeWarning: css`
    background: ${token.colorWarningBg};
    color: ${token.colorWarning};
  `,
  outlined: css`
    border: ${token.lineWidth}px solid ${token.colorBorder};
    background: ${token.colorBgContainer};
  `,
  stack: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    width: 100%;
    margin: 0;
    text-align: left;
  `,
  stackMiddle: css`
    gap: ${token.padding}px;
  `,
  // Right under the line it belongs to ("We sent a code by SMS"), no plate of its own.
  chip: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXXS}px;
    max-width: 100%;
    margin-top: -${token.marginSM}px;
    font-size: ${token.fontSize}px;
  `,
  chipValue: css`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${token.colorText};
  `,
  footer: css`
    display: block;
    margin-top: auto;
    text-align: center;
  `,
}));
