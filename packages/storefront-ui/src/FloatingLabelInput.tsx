'use client';

import { Input, Typography, theme } from 'antd';
import type { InputProps, InputRef } from 'antd';
import { createStyles } from 'antd-style';
import { useId, useState } from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';

/**
 * Height of the floating-label fields: room for the label over one line of text. `PhoneInput`
 * places its country picker over the start of the field by it.
 */
export const FLOATING_FIELD_HEIGHT = 50;

/**
 * Parts of the field: `root` holds the field and the error under it, `field` is the antd input
 * box (its affix wrapper).
 */
export type FloatingLabelInputPart =
  | 'root'
  | 'field'
  | 'input'
  | 'prefix'
  | 'suffix'
  | 'label'
  | 'error';

export interface FloatingLabelInputProps extends Omit<
  InputProps,
  'className' | 'style' | 'classNames' | 'styles' | 'rootClassName'
> {
  ref?: Ref<InputRef>;
  /** Inside the field while it is empty, over the text once it is filled or focused. */
  label: ReactNode;
  /** Under the field in the error color; it also marks the field invalid and describes it. */
  error?: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<FloatingLabelInputPart, string>>;
  styles?: Partial<Record<FloatingLabelInputPart, CSSProperties>>;
}

/** antd `Input` with its label inside: over the text once the field is filled or focused. */
export const FloatingLabelInput = ({
  ref,
  label,
  error,
  className,
  style,
  classNames,
  styles: partStyles,
  onFocus,
  onBlur,
  placeholder,
  ...inputProps
}: FloatingLabelInputProps) => {
  const { styles, cx } = useStyles();
  const { token } = theme.useToken();
  const [focused, setFocused] = useState(false);
  // What the buyer typed into an uncontrolled field; it starts from `defaultValue`.
  const [typed, setTyped] = useState(() => Boolean(inputProps.defaultValue));
  const controlled = inputProps.value !== undefined;
  const reactId = useId();
  const id = inputProps.id ?? `sf-input-${reactId}`;
  const errorId = `${id}-error`;
  const status = error ? 'error' : inputProps.status;
  // A value the field knows of floats the label here; one it does not (restored by the browser,
  // autofilled) floats it through CSS, which sees what the input holds.
  const floating =
    focused || (controlled ? Boolean(String(inputProps.value)) : typed);
  const describedBy =
    [inputProps['aria-describedby'], error ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      className={cx(styles.container, classNames?.root, className)}
      style={{ ...partStyles?.root, ...style }}
    >
      <Input
        ref={ref}
        {...inputProps}
        id={id}
        status={status}
        // An empty placeholder makes `:placeholder-shown` tell an empty field from a filled one.
        placeholder={placeholder ?? ' '}
        aria-invalid={
          inputProps['aria-invalid'] ?? (status === 'error' || undefined)
        }
        aria-describedby={describedBy}
        prefix={
          <span
            className={cx(
              styles.prefix,
              Boolean(inputProps.prefix) && styles.prefixWithContent
            )}
            onMouseDown={(event) => event.preventDefault()}
          >
            {inputProps.prefix ? (
              <span className={styles.prefixContent}>{inputProps.prefix}</span>
            ) : null}
            <label
              htmlFor={id}
              className={cx(
                styles.label,
                floating && styles.floating,
                focused && !status && styles.focused,
                (status || inputProps.disabled) && styles.status,
                classNames?.label
              )}
              style={partStyles?.label}
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
          if (!controlled) setTyped(Boolean(event.target.value));
          inputProps.onChange?.(event);
        }}
        classNames={{
          root: classNames?.field,
          input: classNames?.input,
          prefix: classNames?.prefix,
          suffix: classNames?.suffix,
        }}
        styles={{
          root: {
            paddingTop: 0,
            paddingBottom: 0,
            height: FLOATING_FIELD_HEIGHT,
            ...partStyles?.field,
          },
          input: {
            paddingTop: token.paddingSM,
            height: FLOATING_FIELD_HEIGHT,
            lineHeight: 1,
            ...partStyles?.input,
          },
          prefix: partStyles?.prefix,
          suffix: partStyles?.suffix,
        }}
      />
      {error ? (
        <Typography.Text
          type="danger"
          id={errorId}
          className={classNames?.error}
          style={partStyles?.error}
        >
          {error}
        </Typography.Text>
      ) : null}
    </div>
  );
};

const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
  const floatingRules = `
    transform: translateY(calc(-50% - 10px));
    font-size: ${token.fontSizeSM}px;
  `;
  const floating = css`
    ${floatingRules}
  `;
  const label = css`
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSize}px;
    cursor: text;
    user-select: none;
    transition: all ${token.motionDurationMid} ease;
  `;
  const labelSelector = `.${cx(label)}`;
  return {
    container: css`
      display: flex;
      width: 100%;
      flex-direction: column;
      gap: ${token.marginXXS / 2}px;

      .${prefixCls}-input-prefix {
        position: relative;
        z-index: 2;
        margin-inline-end: 0;
      }

      /* The placeholder is hidden: the label stands in for it. */
      .${prefixCls}-input::placeholder {
        color: transparent;
      }

      /* Filled without the field knowing it: typed into an uncontrolled field, restored by the
         browser or autofilled. Separate rules: a selector a browser does not know drops only
         its own rule. */
      &:has(input:not(:placeholder-shown)) ${labelSelector} {
        ${floatingRules}
      }
      &:has(input:-webkit-autofill) ${labelSelector} {
        ${floatingRules}
      }
      &:has(input:autofill) ${labelSelector} {
        ${floatingRules}
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
    label,
    floating,
    focused: css`
      color: ${token.colorPrimary};
    `,
    status: css`
      color: currentColor;
    `,
  };
});
