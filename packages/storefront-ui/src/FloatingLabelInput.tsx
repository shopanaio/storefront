'use client';

import { Input, Typography } from 'antd';
import type { InputProps } from 'antd';
import type { InputRef } from 'antd/es/input';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface FloatingLabelInputProps extends InputProps {
  label: string;
  wrapperClassName?: string;
  error?: string;
}

export const FloatingLabelInput = forwardRef<InputRef, FloatingLabelInputProps>(
  (
    { label, value, wrapperClassName, error, onFocus, onBlur, ...inputProps },
    ref
  ) => {
    const { styles, cx } = useStyles();
    const inputRef = useRef<InputRef>(null);
    const [focused, setFocused] = useState(false);
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
      Boolean(inputProps.defaultValue)
    );
    const reactId = useId();
    const id = inputProps.id ?? `checkout-input-${reactId}`;
    const controlled = value !== undefined;

    useImperativeHandle(ref, () => inputRef.current!);
    useEffect(() => {
      if (!controlled)
        setUncontrolledHasValue(Boolean(inputProps.defaultValue));
    }, [controlled, inputProps.defaultValue]);

    const hasValue = controlled
      ? Boolean(String(value ?? ''))
      : uncontrolledHasValue;
    const floating = focused || hasValue;
    const status = error ? 'error' : inputProps.status;

    return (
      <div className={clsx(styles.container, wrapperClassName)}>
        <Input
          ref={inputRef}
          {...inputProps}
          id={id}
          value={value}
          status={status}
          prefix={
            <span
              className={cx(
                styles.prefix,
                Boolean(inputProps.prefix) && styles.prefixWithContent
              )}
              onMouseDown={(event) => event.preventDefault()}
            >
              {inputProps.prefix ? (
                <span className={styles.prefixContent}>
                  {inputProps.prefix}
                </span>
              ) : null}
              <label
                htmlFor={id}
                className={cx(
                  styles.label,
                  floating && styles.floating,
                  focused && !status && styles.focused,
                  (status || inputProps.disabled) && styles.status
                )}
              >
                {label}
              </label>
            </span>
          }
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onChange={(event) => {
            if (!controlled)
              setUncontrolledHasValue(Boolean(event.target.value));
            inputProps.onChange?.(event);
          }}
          styles={(info) => ({
            input: { paddingTop: 12, height: 50, lineHeight: 1 },
            root: { paddingTop: 0, paddingBottom: 0, height: 50 },
            ...(typeof inputProps.styles === 'function'
              ? inputProps.styles(info)
              : inputProps.styles),
          })}
        />
        {error ? (
          <Typography.Text type="danger">{error}</Typography.Text>
        ) : null}
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 2px;

    .ant-input-prefix {
      position: relative;
      z-index: 2;
      margin-inline-end: 0;
    }
  `,
  prefix: css`
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 0;
    overflow: visible;
  `,
  prefixWithContent: css`
    width: auto;
  `,
  prefixContent: css`
    display: inline-flex;
    align-items: center;
    padding-right: ${token.paddingXS}px;
  `,
  label: css`
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSize}px;
    cursor: text;
    user-select: none;
    transition: all 0.2s ease;
  `,
  floating: css`
    transform: translateY(calc(-50% - 10px));
    font-size: ${token.fontSizeSM}px;
  `,
  focused: css`
    color: ${token.colorPrimary};
  `,
  status: css`
    color: currentColor;
  `,
}));
