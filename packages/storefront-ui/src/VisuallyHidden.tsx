'use client';

import { createStyles } from 'antd-style';
import type { HTMLAttributes, Ref } from 'react';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Text read out by assistive technology and not shown: the name of an icon-only control, a
 * loading status, the rest of a label cut on a phone.
 */
export const VisuallyHidden = ({
  className,
  ...props
}: VisuallyHiddenProps) => {
  const { styles, cx } = useStyles();
  return <span {...props} className={cx(styles.hidden, className)} />;
};

const useStyles = createStyles(({ css }) => ({
  hidden: css`
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  `,
}));
