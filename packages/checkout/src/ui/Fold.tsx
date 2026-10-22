'use client';

import { Button } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { TbChevronDown } from 'react-icons/tb';

export interface FoldProps {
  open: boolean;
  id?: string;
  children: ReactNode;
}

/**
 * Content that folds to nothing and unfolds, animating its height and fading. Folded, it is out
 * of the tab order. Two folds side by side, one opening as the other closes, swap their content
 * without a jump, as a shipment swaps its pictures for its lines.
 */
export const Fold = ({ open, id, children }: FoldProps) => {
  const { styles, cx } = useStyles();
  return (
    <div id={id} className={cx(styles.fold, open && styles.open)} inert={!open}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
};

export interface FoldToggleProps {
  open: boolean;
  /** Id of the fold it opens. */
  controls: string;
  label: string;
  onClick: () => void;
}

/** The arrow of every folding block of the checkout: down while folded, up while open. */
export const FoldToggle = ({ open, controls, label, onClick }: FoldToggleProps) => {
  const { styles, cx } = useStyles();
  return (
    <Button
      type="text"
      size="small"
      className={styles.toggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      icon={<TbChevronDown size={20} className={cx(styles.chevron, open && styles.chevronUp)} />}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  fold: css`
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows ${token.motionDurationMid} ease,
      opacity ${token.motionDurationMid} ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  open: css`
    grid-template-rows: 1fr;
    opacity: 1;
  `,
  inner: css`
    overflow: hidden;
    min-height: 0;
  `,
  toggle: css`
    flex: none;
    color: ${token.colorTextSecondary};
  `,
  chevron: css`
    transition: transform ${token.motionDurationMid} ease;
  `,
  chevronUp: css`
    transform: rotate(180deg);
  `,
}));
