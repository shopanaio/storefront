'use client';

import React, {
  useState,
  useRef,
  useId,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Input, InputProps, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { InputRef } from 'antd/es/input';
import clsx from 'clsx';

export interface FloatingLabelInputProps extends InputProps {
  /**
   * Label text that will float
   */
  label: string;
  /**
   * Custom className for the wrapper
   */
  wrapperClassName?: string;
  /**
   * Error text to display under the input
   */
  error?: string;
}

/**
 * Input component with floating label effect.
 * Label moves up and shrinks when input is focused or has value.
 */
export const FloatingLabelInput = forwardRef<InputRef, FloatingLabelInputProps>(
  (
    { label, value, wrapperClassName, error, onFocus, onBlur, ...inputProps },
    ref
  ) => {
    const { styles } = useStyles();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const reactId = useId();

    useImperativeHandle(ref, () => inputRef.current!, []);

    // Determine controlled vs uncontrolled and derive hasValue
    const isControlled = value !== undefined;
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
      Boolean(
        inputProps.defaultValue !== undefined &&
          inputProps.defaultValue !== null &&
          String(inputProps.defaultValue).length > 0
      )
    );

    /**
     * Synchronize floating label visibility with both controlled and uncontrolled values.
     * - Controlled: follow `value` prop changes
     * - Uncontrolled: follow `defaultValue` prop changes
     */
    useEffect(() => {
      const nextHasValue = isControlled
        ? Boolean(
            value !== null && value !== undefined && String(value).length > 0
          )
        : Boolean(
            inputProps.defaultValue !== undefined &&
              inputProps.defaultValue !== null &&
              String(inputProps.defaultValue).length > 0
          );
      setUncontrolledHasValue(nextHasValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isControlled, value, inputProps.defaultValue]);

    const hasValue = isControlled
      ? Boolean(value !== null && String(value).length > 0)
      : uncontrolledHasValue;
    const isLabelFloating = isFocused || hasValue;

    /**
     * Whether antd `status` prop is provided. If present, we keep label color as `currentColor`.
     * When not provided and input is focused, we elevate label color to `colorPrimary`.
     * Automatically set status to 'error' when error is provided.
     */
    const finalStatus = error ? 'error' : inputProps.status;
    const hasStatus = Boolean(finalStatus);

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
      console.log('e', e);
      inputProps.onChange?.(e);
    };

    return (
      <div className={clsx(styles.container, wrapperClassName)}>
        <Input
          ref={inputRef}
          {...inputProps}
          status={finalStatus}
          id={inputId}
          prefix={
            <span
              className={clsx(
                styles.prefixWrapper,
                inputProps.prefix ? styles.prefixWrapperHasContent : undefined
              )}
              onMouseDown={(e) => {
                // prevent blur/focus flicker
                e.preventDefault();
              }}
            >
              {inputProps.prefix ? (
                <span className={styles.prefixContent}>
                  {inputProps.prefix}
                </span>
              ) : null}
              <label
                id={labelId}
                htmlFor={inputId}
                className={clsx(styles.label, {
                  [styles.labelFloating]: isLabelFloating,
                  [styles.labelFocused]: !hasStatus && isFocused,
                  [styles.labelStatus]: !!finalStatus || !!inputProps.disabled,
                })}
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
              height: 50,
              lineHeight: 1,
            },
            affixWrapper: {
              paddingTop: 0,
              paddingBottom: 0,
              height: 50,
            },

            ...inputProps.styles,
          }}
        />
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </div>
    );
  }
);

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    gap: 2px;

    & {
      .ant-input-group-addon,
      .ant-input-prefix,
      .ant-input-suffix {
        position: relative;
        z-index: 2;
      }

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
    padding-right: ${token.paddingXS}px;
  `,
  label: css`
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    color: ${token.colorTextSecondary};
    font-size: 14px;
    pointer-events: auto;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
    z-index: 1; /* below addons/prefix/suffix but above input background */
    user-select: none;
    white-space: nowrap; /* keep label in one line */
  `,
  labelFloating: css`
    transform: translateY(calc(-50% - 10px));
    font-size: ${token.fontSizeSM}px;
  `,
  labelFocused: css`
    color: ${token.colorPrimary};
  `,
  labelStatus: css`
    color: currentColor;
  `,
}));

export default FloatingLabelInput;
