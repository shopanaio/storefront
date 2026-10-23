'use client';

import { createStyles, keyframes } from 'antd-style';
import { Fragment, useState } from 'react';
import { useAuthUI } from '../AuthUIProvider';

export type CodeCellsState = 'idle' | 'verifying' | 'error' | 'off';

export interface CodeCellsProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  /** Accessible name: "Confirmation code, 6 digits". */
  label: string;
  state?: CodeCellsState;
  disabled?: boolean;
  autoFocus?: boolean;
  'aria-describedby'?: string;
}

/**
 * The code as cells, split in two halves (3·3). One input under them takes it whole, so the
 * one-time-code autofill of the OS and a paste fill every cell at once.
 */
export const CodeCells = ({
  length,
  value,
  onChange,
  label,
  state = 'idle',
  disabled,
  autoFocus,
  'aria-describedby': describedBy,
}: CodeCellsProps) => {
  const { styles, cx } = useStyles();
  const { part } = useAuthUI();
  // `autoFocus` focuses the input on mount, which fires its focus event.
  const [focused, setFocused] = useState(false);
  const half = length % 2 === 0 ? length / 2 : -1;
  const current = Math.min(value.length, length - 1);
  const off = state === 'off' || disabled;
  // The cell the next digit goes to shows a caret, as a text field does.
  const caretAt =
    focused && !off && state !== 'verifying' && value.length < length
      ? value.length
      : -1;
  const root = part(
    'codeCells',
    cx(
      styles.cells,
      state === 'error' && styles.error,
      state === 'verifying' && styles.done,
      off && styles.off
    )
  );

  return (
    <div className={root.className} style={root.style}>
      {Array.from({ length }, (_, index) => (
        <Fragment key={index}>
          {index === half ? (
            <span className={styles.separator} aria-hidden="true" />
          ) : null}
          <span
            aria-hidden="true"
            data-cell=""
            className={cx(
              styles.cell,
              // The focus stays visible on a wrong or checked code too.
              focused && !off && index === current && styles.active
            )}
          >
            {value[index] ?? ''}
            {index === caretAt ? <span className={styles.caret} /> : null}
          </span>
        </Fragment>
      ))}
      <input
        className={styles.input}
        value={value}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        autoComplete="one-time-code"
        aria-label={label}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={describedBy}
        disabled={off}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, '').slice(0, length))
        }
      />
    </div>
  );
};

const blink = keyframes`
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
`;

const useStyles = createStyles(({ css, token }) => ({
  cells: css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${token.marginXS}px;
  `,
  cell: css`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 56px;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
    color: ${token.colorText};
    font-size: ${token.fontSizeHeading3}px;
    font-weight: ${token.fontWeightStrong};
    font-variant-numeric: tabular-nums;

    @media (max-width: 380px) {
      width: 42px;
      height: 52px;
    }
  `,
  active: css`
    border-color: ${token.colorPrimary};
    background: ${token.colorBgContainer};
    box-shadow: 0 0 0 ${token.controlOutlineWidth}px ${token.controlOutline};
  `,
  caret: css`
    width: 2px;
    height: ${token.fontSizeHeading3}px;
    border-radius: 1px;
    background: ${token.colorText};
    animation: ${blink} 1s step-end infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
  separator: css`
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${token.colorBorder};
  `,
  done: css`
    [data-cell]:not(:empty) {
      border-color: ${token.colorPrimary};
      color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
    }
  `,
  error: css`
    [data-cell] {
      border-color: ${token.colorError};
      background: ${token.colorErrorBg};
    }
  `,
  off: css`
    [data-cell] {
      background: ${token.colorFillTertiary};
      color: ${token.colorTextDisabled};
    }
  `,
  input: css`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    opacity: 0;
    font-size: ${token.fontSizeLG}px;
    cursor: text;
  `,
}));
