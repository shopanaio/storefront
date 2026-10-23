'use client';

import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useAuthUI } from '../AuthUIProvider';

/**
 * Where a container with a header of its own (the checkout drawer) shows the title of the
 * screen: the element in its header. `slot` is null until that element is mounted.
 */
export interface AuthHeadingSlot {
  slot: HTMLElement | null;
}

export const AuthHeadingSlotContext = createContext<AuthHeadingSlot | null>(
  null
);

/** The screen lies in a container whose header carries its title. */
export const useHeadingSlot = () => useContext(AuthHeadingSlotContext);

/**
 * Title and the line under it; `id` names the form it heads. In a container with a header of
 * its own (`AuthHeadingSlotContext`) the title is rendered there, with the same `id`, and the
 * screen keeps the line under it.
 */
export const ScreenTitle = ({
  id,
  title,
  subtitle,
  align = 'center',
}: {
  id?: string;
  /** None when the container already names the step (the contact section of the checkout). */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** `start`: under a section title of the page, as the text of the section. */
  align?: 'center' | 'start';
}) => {
  const { styles, cx } = useStyles();
  const { part, headingLevel } = useAuthUI();
  const host = useHeadingSlot();
  const titlePart = part(
    'title',
    cx(styles.title, host ? styles.inHeader : undefined)
  );
  const subtitlePart = part('subtitle', styles.subtitle);
  const heading = title ? (
    <Typography.Title
      level={headingLevel}
      id={id}
      className={titlePart.className}
      style={titlePart.style}
    >
      {title}
    </Typography.Title>
  ) : null;
  const line = subtitle ? (
    <Typography.Text
      type="secondary"
      className={subtitlePart.className}
      style={subtitlePart.style}
    >
      {subtitle}
    </Typography.Text>
  ) : null;

  if (host) {
    return (
      <>
        {heading && host.slot ? createPortal(heading, host.slot) : null}
        {line}
      </>
    );
  }
  return (
    <div className={cx(styles.head, align === 'start' && styles.headStart)}>
      {heading}
      {line}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  head: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  headStart: css`
    align-self: stretch;
    text-align: left;
  `,
  title: css`
    && {
      margin: 0;
      font-size: ${token.fontSizeHeading3}px;
      line-height: ${token.lineHeightHeading3};
    }
  `,
  // As the title of the other drawers of the page.
  inHeader: css`
    && {
      font-size: ${token.fontSizeXL}px;
      line-height: ${token.lineHeightLG};
      font-weight: 600;
    }
  `,
  subtitle: css`
    font-size: ${token.fontSize}px;
  `,
}));
