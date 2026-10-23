'use client';

import { isValidElement } from 'react';
import type {
  CSSProperties,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  Ref,
} from 'react';
import { theme } from 'antd';
import { createStyles, keyframes } from 'antd-style';
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
import { useStorefrontUI } from '../StorefrontUIProvider';
import type { BannerTone, BannerToneColors } from './tones';
import {
  useBannerTheme,
  useBannerTone,
  type BannerIcon,
  type BannerPart,
} from './BannerProvider';

/** The next step of a banner that leads elsewhere: a link. */
export interface BannerLinkAction {
  label: ReactNode;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  /** A link cannot wait: it leaves the page. */
  loading?: never;
}

/** The next step of a banner done in place: a button. */
export interface BannerButtonAction {
  label: ReactNode;
  href?: undefined;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** The step is running: the button shows a spinner and cannot be pressed again. */
  loading?: boolean;
  disabled?: boolean;
}

export type BannerAction = BannerLinkAction | BannerButtonAction;

export interface BannerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'children'
> {
  ref?: Ref<HTMLDivElement>;
  tone: BannerTone;
  title: ReactNode;
  description?: ReactNode;
  /**
   * One next step, a text link on the right: a link or a button from its description, or a
   * control of its own.
   */
  action?: BannerAction | ReactNode;
  /** Closes the banner. A critical banner stays until its problem is solved and has no close. */
  onDismiss?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name of the close button; the `dismiss` text of `StorefrontUIProvider`. */
  dismissLabel?: string;
  /**
   * The title only, the description and the content left out: one line on desktop, up to two
   * on a phone, where the action leaves the title little room.
   */
  compact?: boolean;
  /** Next to the action, e.g. the counter of other messages. */
  extra?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Classes of the parts, over the ones of `BannerProvider`. */
  classNames?: Partial<Record<BannerPart, string>>;
  /** Styles of the parts, over the ones of `BannerProvider`. */
  styles?: Partial<Record<BannerPart, CSSProperties>>;
  /** Content under the description, e.g. a list of lines with their buttons. */
  children?: ReactNode;
}

const CriticalIcon: BannerIcon = (props) => (
  <LuCircleAlert {...props} strokeWidth={1.75} />
);
const WarningIcon: BannerIcon = (props) => (
  <LuTriangleAlert {...props} strokeWidth={1.75} />
);
const ActionIcon: BannerIcon = (props) => (
  <LuInfo {...props} strokeWidth={1.75} />
);
const SuccessIcon: BannerIcon = (props) => (
  <LuCircleCheck {...props} strokeWidth={1.75} />
);

const ICONS: Record<BannerTone, BannerIcon> = {
  critical: CriticalIcon,
  warning: WarningIcon,
  action: ActionIcon,
  success: SuccessIcon,
};

const isActionDescription = (
  action: BannerProps['action']
): action is BannerAction =>
  typeof action === 'object' &&
  action !== null &&
  !isValidElement(action) &&
  'label' in action;

/**
 * Message of the storefront (the checkout, the sign-in), in the style of the Shopify checkout
 * banner: a 1px border, an icon without a circle, a bold title with the text under it and one
 * action as a text link. The colors of the tones come from the antd status tokens.
 */
export const Banner = ({
  ref,
  tone,
  title,
  description,
  action,
  onDismiss,
  dismissLabel,
  compact = false,
  extra,
  className,
  style,
  classNames,
  styles: partStyles,
  children,
  ...rest
}: BannerProps) => {
  const colors = useBannerTone(tone);
  const { styles } = useStyles({ colors });
  const { token } = theme.useToken();
  const { texts } = useStorefrontUI();
  const bannerTheme = useBannerTheme();
  const part = (name: BannerPart, ...own: (string | false | undefined)[]) => ({
    className: clsx(...own, bannerTheme.classNames?.[name], classNames?.[name]),
    style: { ...bannerTheme.styles?.[name], ...partStyles?.[name] },
  });
  const Icon = bannerTheme.icons?.[tone] ?? ICONS[tone];
  const iconSize = Math.round(token.fontSize * 1.25);
  const dismissible = tone !== 'critical' && onDismiss;
  const root = part('root', styles.banner, className);

  const renderAction = () => {
    if (!isActionDescription(action)) return action;
    if (action.href !== undefined) {
      return (
        <a
          {...part('action', styles.action)}
          href={action.href}
          target={action.target}
          rel={action.rel}
          onClick={action.onClick}
        >
          {action.label}
        </a>
      );
    }
    return (
      <button
        type="button"
        {...part(
          'action',
          styles.action,
          action.loading && styles.actionLoading
        )}
        onClick={action.onClick}
        disabled={action.loading || action.disabled}
        aria-busy={action.loading || undefined}
      >
        {action.loading ? (
          <LuLoaderCircle
            size={token.fontSize}
            aria-hidden="true"
            className={styles.spinner}
          />
        ) : null}
        {action.label}
      </button>
    );
  };

  return (
    <div
      {...rest}
      ref={ref}
      role={tone === 'critical' ? 'alert' : 'status'}
      data-tone={tone}
      className={root.className}
      style={{ ...root.style, ...style }}
    >
      <span {...part('icon', styles.icon)} aria-hidden="true">
        <Icon size={iconSize} aria-hidden />
      </span>
      <div {...part('title', styles.title, compact && styles.titleCompact)}>
        {title}
      </div>
      <div {...part('side', styles.side)}>
        {extra}
        {renderAction()}
        {dismissible ? (
          <button
            type="button"
            {...part('close', styles.close)}
            aria-label={dismissLabel ?? texts.dismiss}
            onClick={onDismiss}
          >
            <LuX
              size={token.fontSizeLG}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
      {compact ? null : (
        <>
          {description ? (
            <div {...part('description', styles.description)}>
              {description}
            </div>
          ) : null}
          {children ? (
            <div {...part('content', styles.content)}>{children}</div>
          ) : null}
        </>
      )}
    </div>
  );
};

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const useStyles = createStyles(
  ({ css, token }, { colors }: { colors: BannerToneColors }) => {
    // One line of the banner: the title, the icon, the action and the close button share it.
    const line = Math.round(token.fontSize * token.lineHeight);
    const closeSize = token.controlHeightLG;
    const closeOffset = (line - closeSize) / 2;
    return {
      banner: css`
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: start;
        box-sizing: border-box;
        width: 100%;
        padding: ${token.paddingSM}px ${token.padding}px;
        border: ${token.lineWidth}px ${token.lineType} ${colors.border};
        border-radius: ${token.borderRadiusLG}px;
        background: ${colors.background};
        color: ${colors.text};
        /* Portalled out of the page (a drawer), it keeps the font of the theme; in a centered
         column (the sign-in) its text still starts at the icon. */
        font-family: ${token.fontFamily};
        text-align: start;
        font-size: ${token.fontSize}px;
        line-height: ${line}px;
      `,
      icon: css`
        grid-column: 1;
        grid-row: 1;
        display: flex;
        align-items: center;
        height: ${line}px;
        margin-inline-end: ${token.marginXS}px;
        color: ${colors.accent};
      `,
      title: css`
        grid-column: 2;
        grid-row: 1;
        min-width: 0;
        font-weight: ${token.fontWeightStrong};
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
        gap: ${token.marginXXS}px;
        height: ${line}px;
        /* Clear of the title once the action's touch padding is taken off. */
        margin-inline-start: ${token.marginLG}px;
      `,
      actionLoading: css`
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        cursor: default;
        opacity: 0.65;
      `,
      spinner: css`
        animation: ${spin} 1s linear infinite;

        @media (prefers-reduced-motion: reduce) {
          animation: none;
        }
      `,
      action: css`
        /* A touch target of a control's height around one line of text. */
        margin: -${token.paddingSM}px -${token.paddingXS}px;
        padding: ${token.paddingSM}px ${token.paddingXS}px;
        border: 0;
        background: transparent;
        font: inherit;
        color: ${colors.accent};
        text-decoration: underline;
        text-underline-offset: ${token.lineWidthBold}px;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          color: ${colors.accent};
          text-decoration: underline;
          text-decoration-thickness: ${token.lineWidthBold}px;
        }

        &:focus-visible {
          outline: ${token.lineWidthBold}px solid ${token.colorPrimaryBorder};
          outline-offset: -${token.lineWidthBold}px;
        }
      `,
      close: css`
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${closeSize}px;
        height: ${closeSize}px;
        margin: ${closeOffset}px -${token.paddingSM}px ${closeOffset}px 0;
        padding: 0;
        border: 0;
        border-radius: ${token.borderRadius}px;
        background: transparent;
        color: ${colors.text};
        cursor: pointer;

        &:focus-visible {
          outline: ${token.lineWidthBold}px solid ${token.colorPrimaryBorder};
          outline-offset: -${token.lineWidthBold}px;
        }
      `,
      // Secondary to the title in every tone, so it reads as the explanation of it.
      description: css`
        grid-column: 2 / 4;
        margin: 0;
        color: ${token.colorTextSecondary};
      `,
      content: css`
        grid-column: 2 / 4;
        margin-top: ${token.marginSM}px;
      `,
    };
  }
);
