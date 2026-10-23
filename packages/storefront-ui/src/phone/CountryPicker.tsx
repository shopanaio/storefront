'use client';

import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, Ref } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { getCountryCallingCode } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import type { Labels } from 'react-phone-number-input';
import type { Breakpoint } from '../breakpoints';
import type { DomAttributes } from '../dom';
import { useDrawerLayer } from '../drawer/layer';
import {
  useStorefrontUI,
  type CountryPickerTexts,
} from '../StorefrontUIProvider';
import { useBreakpointDown } from '../useMediaQuery';
import {
  countryOptions,
  useCountryLabels,
  type Country,
  type CountryOption,
} from './countries';

/** Parts of the picker: the flag control, the popover and its list of countries. */
export type CountryPickerPart = 'root' | 'popup' | 'list' | 'option';

export interface CountryPickerProps extends DomAttributes {
  /** The root element: the flag with the control over it. */
  ref?: Ref<HTMLSpanElement>;
  value?: Country;
  onChange: (country: Country) => void;
  /** Countries to choose from. */
  countries: readonly Country[];
  /** Locale of the country names (`uk`, `ru`, `en`); the one of `StorefrontUIProvider`. */
  locale?: string;
  /** Texts over the ones of `StorefrontUIProvider`. */
  texts?: Partial<CountryPickerTexts>;
  disabled?: boolean;
  /** Controlled open state of the popover; uncontrolled by default. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Below it (phones and tablets) the device's own select; `lg` by default. */
  breakpoint?: Breakpoint;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<CountryPickerPart, string>>;
  styles?: Partial<Record<CountryPickerPart, CSSProperties>>;
}

export interface CountryFlagProps extends DomAttributes {
  ref?: Ref<HTMLSpanElement>;
  country?: Country;
  /** Name of the flag image; read out only when the flag is not `aria-hidden`. */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/** Flag of a country in a 24×16 frame; decorative (`aria-hidden`) unless told otherwise. */
export const CountryFlag = ({
  ref,
  country,
  title,
  className,
  style,
  ...attributes
}: CountryFlagProps) => {
  const { styles, cx } = useStyles();
  const Flag = country ? flags[country] : undefined;
  return (
    <span
      aria-hidden
      {...attributes}
      ref={ref}
      className={cx(styles.flag, className)}
      style={style}
    >
      {Flag ? <Flag title={title ?? country ?? ''} /> : null}
    </span>
  );
};

/**
 * Country of a phone number: a flag with a chevron. Below `breakpoint` (phones and tablets) it
 * is the device's own select, its wheel or sheet; from it up, a popover with the list, the
 * selected country on top. The list owns the keyboard: the arrows, Home and End move through
 * the countries, letters jump to a name, Enter picks one, Escape closes it.
 */
export const CountryPicker = ({
  ref,
  value,
  onChange,
  countries,
  locale: localeProp,
  texts: textOverrides,
  disabled,
  open: openProp,
  onOpenChange,
  breakpoint = 'lg',
  className,
  style,
  classNames,
  styles: partStyles,
  ...attributes
}: CountryPickerProps) => {
  const { styles, cx } = useStyles();
  const ui = useStorefrontUI();
  const locale = localeProp ?? ui.locale;
  const texts = { ...ui.texts.countryPicker, ...textOverrides };
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const native = useBreakpointDown(breakpoint);
  const layer = useDrawerLayer();
  const labels = useCountryLabels(locale);
  const name = value ? (labels[value] ?? value) : '';
  const label = value
    ? texts.trigger(name, getCountryCallingCode(value))
    : texts.title;
  const rootProps = {
    ...attributes,
    ref,
    className: cx(styles.root, classNames?.root, className),
    style: { ...partStyles?.root, ...style },
  };
  const face = (
    <>
      <CountryFlag country={value} title={name} />
      <LuChevronDown size={16} aria-hidden className={styles.chevron} />
    </>
  );

  if (native) {
    return (
      <span {...rootProps}>
        {face}
        <NativeCountrySelect
          value={value}
          countries={countries}
          labels={labels}
          locale={locale}
          label={label}
          disabled={disabled}
          onChange={onChange}
        />
      </span>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => setOpen(next)}
      trigger="click"
      placement="bottomLeft"
      arrow={false}
      destroyOnHidden
      // In a drawer, which keeps the focus and the pointer in it, the list opens inside it.
      getPopupContainer={layer?.container ? () => layer.container! : undefined}
      zIndex={layer ? layer.zIndex + 1 : undefined}
      content={
        <div
          className={cx(styles.popover, classNames?.popup)}
          style={partStyles?.popup}
        >
          <CountryList
            countries={countries}
            labels={labels}
            locale={locale}
            value={value}
            title={texts.title}
            onSelect={(country) => {
              onChange(country);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
            classNames={classNames}
            styles={partStyles}
          />
        </div>
      }
    >
      <span {...rootProps}>
        <button
          type="button"
          className={styles.button}
          aria-label={label}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          {face}
        </button>
      </span>
    </Popover>
  );
};

/**
 * The device's select over the flag: transparent and as large as it, so a tap opens the
 * system picker. The countries go by name; the name is followed by the calling code.
 */
const NativeCountrySelect = ({
  value,
  countries,
  labels,
  locale,
  label,
  disabled,
  onChange,
}: {
  value?: Country;
  countries: readonly Country[];
  labels: Labels;
  locale: string;
  label: string;
  disabled?: boolean;
  onChange: (country: Country) => void;
}) => {
  const { styles } = useStyles();
  const options = useMemo(
    () => countryOptions({ countries, labels, locale }),
    [countries, labels, locale]
  );
  return (
    <select
      className={styles.native}
      value={value ?? ''}
      aria-label={label}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as Country)}
    >
      {value ? null : <option value="" disabled />}
      {options.map((option) => (
        <option key={option.country} value={option.country}>
          {option.name} (+{option.callingCode})
        </option>
      ))}
    </select>
  );
};

/** How long typed letters add up to one name. */
const TYPE_AHEAD_MS = 600;

const CountryList = ({
  countries,
  labels,
  locale,
  value,
  title,
  onSelect,
  onClose,
  classNames,
  styles: partStyles,
}: {
  countries: readonly Country[];
  labels: Labels;
  locale: string;
  value?: Country;
  title: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
  classNames?: Partial<Record<CountryPickerPart, string>>;
  styles?: Partial<Record<CountryPickerPart, CSSProperties>>;
}) => {
  const { styles, cx } = useStyles();
  const [active, setActive] = useState(0);
  const listId = useId();
  const typed = useRef({ text: '', at: 0 });
  const options = useMemo(
    () => countryOptions({ countries, labels, locale, selected: value }),
    [countries, labels, locale, value]
  );
  const listRef = useRef<HTMLUListElement>(null);
  const optionId = (index: number) => `${listId}-${index}`;
  const activeOption = options[active];

  // The list takes the focus as it opens: the keyboard goes on from the trigger.
  useEffect(() => {
    listRef.current?.focus({ preventScroll: true });
  }, []);

  // The highlighted country stays in view as the keyboard moves it.
  useEffect(() => {
    if (!activeOption) return;
    document
      .getElementById(`${listId}-${active}`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [listId, active, activeOption]);

  const move = (event: KeyboardEvent<HTMLUListElement>, next: number) => {
    event.preventDefault();
    if (options.length)
      setActive(Math.min(Math.max(next, 0), options.length - 1));
  };

  /** The first country whose name starts with the letters typed in a row. */
  const typeAhead = (key: string) => {
    const now = Date.now();
    const text =
      (now - typed.current.at < TYPE_AHEAD_MS ? typed.current.text : '') +
      key.toLocaleLowerCase(locale);
    typed.current = { text, at: now };
    const index = findByName(options, text, locale);
    if (index >= 0) setActive(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        return move(event, active + 1);
      case 'ArrowUp':
        return move(event, active - 1);
      case 'Home':
        return move(event, 0);
      case 'End':
        return move(event, options.length - 1);
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeOption) onSelect(activeOption.country);
        return;
      case 'Escape':
        event.preventDefault();
        onClose();
        return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      typeAhead(event.key);
    }
  };

  return (
    <ul
      id={listId}
      role="listbox"
      ref={listRef}
      tabIndex={0}
      aria-label={title}
      aria-activedescendant={activeOption ? optionId(active) : undefined}
      className={cx(styles.options, classNames?.list)}
      style={partStyles?.list}
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => (
        <li
          key={option.country}
          id={optionId(index)}
          role="option"
          aria-selected={option.country === value}
          className={cx(
            styles.option,
            option.country === value && styles.optionSelected,
            index === active && styles.optionActive,
            classNames?.option
          )}
          style={partStyles?.option}
          onMouseEnter={() => setActive(index)}
          onClick={() => onSelect(option.country)}
        >
          <CountryFlag country={option.country} title={option.name} />
          <span className={styles.optionName}>{option.name}</span>
          <span className={styles.optionCode}>+{option.callingCode}</span>
        </li>
      ))}
    </ul>
  );
};

const findByName = (
  options: readonly CountryOption[],
  text: string,
  locale: string
) =>
  options.findIndex((option) =>
    option.name.toLocaleLowerCase(locale).startsWith(text)
  );

const useStyles = createStyles(({ css, cx, token }) => {
  const optionActive = css`
    background: ${token.colorFillTertiary};
  `;
  return {
    root: css`
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: ${token.marginXXS}px;
      height: 36px;
      padding: 0 ${token.paddingXS}px;
      border-right: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px 0 0 ${token.borderRadius}px;
      color: ${token.colorTextTertiary};

      &:hover:not(:has(:disabled)) {
        background: ${token.colorFillSecondary};
      }

      &:has(:focus-visible) {
        outline: 2px solid ${token.colorPrimaryBorder};
        outline-offset: 1px;
      }
    `,
    button: css`
      display: inline-flex;
      align-items: center;
      gap: inherit;
      height: 100%;
      margin: 0 -${token.paddingXS}px;
      padding: 0 ${token.paddingXS}px;
      border: 0;
      border-radius: inherit;
      background: transparent;
      color: inherit;
      cursor: pointer;

      &:disabled {
        cursor: default;
      }

      &:focus-visible {
        outline: none;
      }
    `,
    // Over the whole flag control; its own look is hidden, the system picker opens on tap.
    native: css`
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      font-size: 16px;
      appearance: none;

      &:disabled {
        cursor: default;
      }
    `,
    chevron: css`
      flex: none;
    `,
    flag: css`
      display: inline-flex;
      width: 24px;
      height: 16px;
      flex: none;
      overflow: hidden;
      border-radius: ${token.borderRadiusXS}px;
      background: ${token.colorFillSecondary};
      box-shadow: inset 0 0 0 1px ${token.colorFillSecondary};

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
    popover: css`
      width: 320px;
      max-width: calc(100vw - ${token.paddingLG * 2}px);
    `,
    options: css`
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 320px;
      overflow: auto;
      outline: none;
    `,
    option: css`
      display: flex;
      align-items: center;
      gap: ${token.paddingSM}px;
      height: 40px;
      padding: 0 ${token.paddingXS}px;
      border-radius: ${token.borderRadius}px;
      color: ${token.colorText};
      font-size: ${token.fontSize}px;
      cursor: pointer;
    `,
    optionActive,
    optionSelected: css`
      background: ${token.colorPrimaryBg};

      &.${cx(optionActive)} {
        background: ${token.colorPrimaryBgHover};
      }
    `,
    optionName: css`
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    optionCode: css`
      color: ${token.colorTextTertiary};
    `,
  };
});
