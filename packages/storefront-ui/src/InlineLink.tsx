'use client';

import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import { createStyles } from 'antd-style';

export interface InlineLinkProps extends Omit<
  ButtonProps,
  'type' | 'variant' | 'size' | 'block' | 'shape' | 'icon'
> {
  /** `default` takes the color of the sentence; `primary` by default. */
  color?: 'primary' | 'default';
  /** Underlined, as a link within secondary text (a legal note, a policy). */
  underline?: boolean;
}

/**
 * An antd link button set in the line of the sentence it belongs to ("Want a password?
 * Sign up", "the privacy policy"): no padding or height of its own, the font of the text
 * around it, wrapping with it on a phone. A link with `href`, a button otherwise.
 */
export const InlineLink = ({
  color = 'primary',
  underline = false,
  className,
  ...props
}: InlineLinkProps) => {
  const { styles, cx } = useStyles();
  return (
    <Button
      {...props}
      color={color}
      variant="link"
      className={cx(styles.link, underline && styles.underline, className)}
    />
  );
};

const useStyles = createStyles(({ css }) => ({
  link: css`
    && {
      display: inline;
      height: auto;
      padding: 0;
      font-size: inherit;
      line-height: inherit;
      white-space: normal;
      text-align: start;
      vertical-align: baseline;
    }
  `,
  underline: css`
    && {
      text-decoration: underline;
    }
  `,
}));
