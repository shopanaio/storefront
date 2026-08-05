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
    const { styles } = useStyles();
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
      if (!controlled) setUncontrolledHasValue(Boolean(inputProps.defaultValue));
    }, [controlled, inputProps.defaultValue]);

    const hasValue = controlled ? Boolean(String(value ?? '')) : uncontrolledHasValue;
    const floating = focused || hasValue;

    return (
      <div className={clsx(styles.container, wrapperClassName)}>
        <Input
          ref={inputRef}
          {...inputProps}
          id={id}
          value={value}
          status={error ? 'error' : inputProps.status}
          prefix={
            <span className={styles.prefix}>
              {inputProps.prefix}
              <label
                htmlFor={id}
                className={clsx(styles.label, floating && styles.floating)}
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
            if (!controlled) setUncontrolledHasValue(Boolean(event.target.value));
            inputProps.onChange?.(event);
          }}
        />
        {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
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
  `,
  prefix: css`
    position: relative;
    display: inline-flex;
    align-items: center;
  `,
  label: css`
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
    color: ${token.colorTextSecondary};
    transition: all 0.2s ease;
  `,
  floating: css`
    transform: translateY(calc(-50% - 10px));
    font-size: ${token.fontSizeSM}px;
  `,
}));
