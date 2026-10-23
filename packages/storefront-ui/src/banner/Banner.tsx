'use client';

import type { ReactNode } from 'react';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import {
  LuCircleAlert,
  LuCircleCheck,
  LuInfo,
  LuLoaderCircle,
  LuTriangleAlert,
  LuX,
} from 'react-icons/lu';
import { mq } from '../breakpoints';
import type { BannerTone } from './tones';
import { BANNER_TONES, bannerToneVar } from './tones';
import { useBannerTheme, type BannerIcon, type BannerPart } from './BannerProvider';

export interface BannerAction {
  label: string;
  /** A link when set, a button otherwise. */
  href?: string;
  onClick?: () => void;
  /** The step is running: the button waits for it and cannot be pressed again. */
  loading?: boolean;
}

export interface BannerProps {
  tone: BannerTone;
  title: ReactNode;
  description?: ReactNode;
  /** One next step, shown as a text link on the right. */
  action?: BannerAction;
  /** Closes the banner. A critical banner stays until its problem is solved and has no close. */
  onDismiss?: () => void;
  /** Accessible name of the close button. */
  dismissLabel?: string;
  /**
   * The title only, the description and the content left out: one line on desktop, up to two
   * on a phone, where the action leaves the title little room.
   */
  compact?: boolean;
  /** Next to the action, e.g. the counter of other messages. */
  extra?: ReactNode;
  className?: string;
  /** Content under the description, e.g. a list of lines with their buttons. */
  children?: ReactNode;
}

const outline =
  (Icon: typeof LuInfo): BannerIcon =>
  // eslint-disable-next-line react/display-name -- One outline icon per tone, never inspected.
  (props) => <Icon {...props} strokeWidth={1.75} />;

const ICONS: Record<BannerTone, BannerIcon> = {
  critical: outline(LuCircleAlert),
  warning: outline(LuTriangleAlert),
  action: outline(LuInfo),
  success: outline(LuCircleCheck),
};

/**
 * Message of the storefront (the checkout, the sign-in), in the style of the Shopify checkout
 * banner: a 1px border, radius 12,
 * an icon without a circle, a bold title with the text under it and one action as a text link.
 */
export const Banner = ({
  tone,
  title,
  description,
  action,
  onDismiss,
  dismissLabel,
  compact = false,
  extra,
  className,
  children,
}: BannerProps) => {
  const { styles } = useStyles();
  const theme = useBannerTheme();
  const part = (name: BannerPart, ...own: (string | false | undefined)[]) => ({
    className: clsx(...own, theme.classNames?.[name]),
    style: theme.styles?.[name],
  });
  const Icon = theme.icons?.[tone] ?? ICONS[tone];
  const color = (name: keyof typeof BANNER_TONES[typeof tone]) =>
    `var(${bannerToneVar(tone, name)}, ${theme.tones?.[tone]?.[name] ?? BANNER_TONES[tone][name]})`;
  const dismissible = tone !== 'critical' && onDismiss;
  const body = compact ? null : (
    <>
      {description ? (
        <div {...part('description', styles.description)}>{description}</div>
      ) : null}
      {children ? <div {...part('content', styles.content)}>{children}</div> : null}
    </>
  );
  const root = part('root', styles.banner, className);

  return (
    <div
      role={tone === 'critical' ? 'alert' : 'status'}
      data-tone={tone}
      className={root.className}
      style={{
        ['--banner-bg' as string]: color('background'),
        ['--banner-border' as string]: color('border'),
        ['--banner-text' as string]: color('text'),
        ['--banner-accent' as string]: color('accent'),
        ...root.style,
      }}
    >
      <span {...part('icon', styles.icon)} aria-hidden="true">
        <Icon size={18} aria-hidden />
      </span>
      <div {...part('title', styles.title, compact && styles.titleCompact)}>{title}</div>
      <div {...part('side', styles.side)}>
        {extra}
        {action ? (
          action.href ? (
            <a
              {...part('action', styles.action)}
              href={action.href}
              onClick={action.onClick}
            >
              {action.label}
            </a>
          ) : (
            <button
              type="button"
              {...part('action', styles.action, action.loading && styles.actionLoading)}
              onClick={action.onClick}
              disabled={action.loading}
              aria-busy={action.loading || undefined}
            >
              {action.loading ? (
                <LuLoaderCircle
                  size={14}
                  aria-hidden="true"
                  className={styles.spinner}
                />
              ) : null}
              {action.label}
            </button>
          )
        ) : null}
        {dismissible ? (
          <button
            type="button"
            {...part('close', styles.close)}
            aria-label={dismissLabel}
            onClick={onDismiss}
          >
            <LuX size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {body}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  banner: css`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: start;
    box-sizing: border-box;
    width: 100%;
    padding: 15px 16px;
    border: 1px solid var(--banner-border);
    border-radius: 12px;
    background: var(--banner-bg);
    color: var(--banner-text);
    /* Portalled out of the page (a drawer), it keeps the font of the theme; in a centered
       column (the sign-in) its text still starts at the icon. */
    font-family: ${token.fontFamily};
    text-align: left;
    font-size: 14px;
    line-height: 19px;
  `,
  icon: css`
    grid-column: 1;
    grid-row: 1;
    display: flex;
    align-items: center;
    height: 19px;
    margin-right: 10px;
    color: var(--banner-accent);
  `,
  title: css`
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    font-weight: 600;
  `,
  titleCompact: css`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;

    ${mq.lg} {
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  `,
  side: css`
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    height: 19px;
    /* 16px from the title once the action's touch padding is taken off. */
    margin-left: 24px;
  `,
  actionLoading: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: default;
    opacity: 0.65;
  `,
  spinner: css`
    animation: banner-spin 1s linear infinite;
    @keyframes banner-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  action: css`
    /* 44px touch target around one line of text. */
    margin: -12px -8px;
    padding: 12px 8px;
    border: 0;
    background: transparent;
    font: inherit;
    color: var(--banner-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
      color: var(--banner-accent);
      text-decoration: underline;
      text-decoration-thickness: 2px;
    }
  `,
  close: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin: -12px -14px -13px 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--banner-text);
    cursor: pointer;
  `,
  // Secondary to the title in every tone, so it reads as the explanation of it.
  description: css`
    grid-column: 2 / 4;
    margin: 0;
    color: ${token.colorTextSecondary};
  `,
  content: css`
    grid-column: 2 / 4;
    margin-top: 12px;
  `,
}));
