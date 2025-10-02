'use client';

import React, { useState, useRef, useId } from 'react';
import { Input, InputProps, Form } from 'antd';
import { createStyles } from 'antd-style';
import { InputRef } from 'antd/es/input';
import clsx from 'clsx';

export interface FloatingLabelInputProps
  extends Omit<InputProps, 'placeholder'> {
  /**
   * Label text that will float
   */
  label: string;
  /**
   * Custom className for the wrapper
   */
  wrapperClassName?: string;
  /**
   * Optional status to colorize the floating label.
   * Accepts success | warning | error regardless of AntD Input limitations.
   */
  labelStatus?: 'success' | 'warning' | 'error';
}

/**
 * Input component with floating label effect.
 * Label moves up and shrinks when input is focused or has value.
 */
export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  wrapperClassName,
  onFocus,
  onBlur,
  status,
  ...inputProps
}) => {
  const { styles, cx } = useStyles();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const reactId = useId();

  // Determine controlled vs uncontrolled and derive hasValue
  const isControlled = value !== undefined;
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    Boolean(
      inputProps.defaultValue !== undefined &&
        inputProps.defaultValue !== null &&
        String(inputProps.defaultValue).length > 0
    )
  );

  const hasValue = isControlled
    ? Boolean(value !== null && String(value).length > 0)
    : uncontrolledHasValue;
  const isLabelFloating = isFocused || hasValue;

  // Accessible ids for label/input association
  const inputId = inputProps.id ?? `fli-${reactId}`;
  const labelId = `${inputId}-label`;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleLabelClick = () => {
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setUncontrolledHasValue(e.target.value.length > 0);
    }
    inputProps.onChange?.(e);
  };

  return (
    <div
      className={clsx(
        styles.wrapper,
        wrapperClassName,
        !inputProps.prefix && styles.wrapperDefault
      )}
    >
      <Input
        ref={inputRef}
        {...inputProps}
        id={inputId}
        prefix={
          <span
            className={cx(
              styles.prefixWrapper,
              inputProps.prefix ? styles.prefixWrapperHasContent : undefined
            )}
            onMouseDown={(e) => {
              // prevent blur/focus flicker
              e.preventDefault();
            }}
          >
            {inputProps.prefix ? (
              <span className={styles.prefixContent}>{inputProps.prefix}</span>
            ) : null}
            <label
              id={labelId}
              htmlFor={inputId}
              className={cx(
                styles.label,
                isLabelFloating && styles.labelFloating,
                status && styles[`label${status}`],
                Boolean(inputProps.prefix) && styles.labelWithPrefix
              )}
              onClick={handleLabelClick}
            >
              {label}
            </label>
          </span>
        }
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        aria-labelledby={labelId}
        styles={{
          input: {
            paddingTop: 12,
            height: 56,
            lineHeight: 1,
          },
          affixWrapper: {
            paddingTop: 0,
            paddingBottom: 0,
            height: 56,
          },

          ...inputProps.styles,
        }}
      />
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  wrapper: css`
    position: relative;
    width: 100%;
    /* Ensure addons/prefix/suffix are above the floating label so it never overlaps them */

    & {
      .ant-input-group-addon,
      .ant-input-prefix,
      .ant-input-suffix {
        position: relative;
        z-index: 2;
      }
    }
  `,
  wrapperDefault: css`
    & {
      .ant-input-affix-wrapper .ant-input-prefix {
        margin-inline-end: 0 !important;
      }
    }
  `,
  prefixWrapper: css`
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 0; /* do not shift input content when no custom prefix */
    overflow: visible;
  `,
  prefixWrapperHasContent: css`
    width: auto; /* when custom prefix provided, occupy its natural width */
  `,
  prefixContent: css`
    display: inline-flex;
    align-items: center;
  `,
  label: css`
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    color: ${token.colorTextPlaceholder};
    font-size: 14px;
    pointer-events: auto;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
    z-index: 1; /* below addons/prefix/suffix but above input background */
    user-select: none;
    white-space: nowrap; /* keep label in one line */
  `,
  labelWithPrefix: css`
    left: 100%; /* start after prefix + small gap */
  `,
  labelFloating: css`
    /* move label above the placeholder purely with transform, tuned for new paddings */
    transform: translateY(calc(-50% - 10px));
    font-size: 12px;
  `,
  labelFloatingDefaultColor: css`
    color: ${token.colorTextSecondary};
  `,
  labelFocused: css`
    color: ${token.colorPrimary};
  `,
  labelError: css`
    color: ${token.colorError};
  `,
  labelWarning: css`
    color: ${token.colorWarning};
  `,
  labelSuccess: css`
    color: ${token.colorSuccess};
  `,
}));

export default FloatingLabelInput;
