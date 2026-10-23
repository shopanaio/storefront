'use client';

import { Input, Popover, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useEffect, useId, useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent, Ref } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { getCountryCallingCode } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import type { Labels } from 'react-phone-number-input';
import type { Breakpoint } from '../breakpoints';
import type { DomAttributes } from '../dom';
import { useDrawerLayer } from '../drawer/layer';
import { Sheet } from '../drawer/Sheet';
import {
  useStorefrontUI,
  type CountryPickerTexts,
} from '../StorefrontUIProvider';
import { useBreakpointDown } from '../useMediaQuery';
import { countryOptions, useCountryLabels, type Country } from './countries';

/** Parts of the picker: the flag button, the popup (popover or sheet) and its list. */
export type CountryPickerPart =
  | 'root'
  | 'popup'
  | 'search'
  | 'list'
  | 'option'
  | 'empty';

export interface CountryPickerProps extends DomAttributes {
  /** The flag button. */
  ref?: Ref<HTMLButtonElement>;
  value?: Country;
  onChange: (country: Country) => void;
  /** Countries to choose from. */
  countries: readonly Country[];
  /** Locale of the country names (`uk`, `ru`, `en`); the one of `StorefrontUIProvider`. */
  locale?: string;
  /** Texts over the ones of `StorefrontUIProvider`. */
  texts?: Partial<CountryPickerTexts>;
  disabled?: boolean;
  /** Controlled open state; uncontrolled by default. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Below it the list is a bottom sheet; `md` by default. */
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
 * Country of a phone number: a flag button that opens a searchable list, the selected country
 * on top. A popover from `breakpoint` up, a vaul bottom sheet below it. The search field is a
 * combobox: the arrows, Home and End move through the countries, Enter picks one.
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
  breakpoint = 'md',
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
  const isPhone = useBreakpointDown(breakpoint);
  const layer = useDrawerLayer();
  const labels = useCountryLabels(locale);
  const titleId = useId();
  const name = value ? (labels[value] ?? value) : '';

  const select = (country: Country) => {
    onChange(country);
    setOpen(false);
  };

  const list = (
    <CountryList
      countries={countries}
      labels={labels}
      locale={locale}
      value={value}
      texts={texts}
      // On a phone the keyboard would cover most of the sheet before the buyer asks for it.
      autoFocus={!isPhone}
      onSelect={select}
      onClose={() => setOpen(false)}
      classNames={classNames}
      styles={partStyles}
    />
  );

  const trigger = (
    <button
      {...attributes}
      ref={ref}
      type="button"
      className={cx(styles.trigger, classNames?.root, className)}
      style={{ ...partStyles?.root, ...style }}
      aria-label={
        value ? texts.trigger(name, getCountryCallingCode(value)) : texts.title
      }
      aria-haspopup="dialog"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen(!open)}
    >
      <CountryFlag country={value} title={name} />
      <LuChevronDown size={16} aria-hidden className={styles.chevron} />
    </button>
  );

  if (isPhone) {
    return (
      <>
        {trigger}
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          direction="bottom"
          aria-labelledby={titleId}
        >
          <div
            className={cx(styles.sheet, classNames?.popup)}
            style={partStyles?.popup}
          >
            <Typography.Text strong id={titleId} className={styles.sheetTitle}>
              {texts.title}
            </Typography.Text>
            {list}
          </div>
        </Sheet>
      </>
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
          role="dialog"
          aria-label={texts.title}
          className={cx(styles.popover, classNames?.popup)}
          style={partStyles?.popup}
        >
          {list}
        </div>
      }
    >
      {trigger}
    </Popover>
  );
};

const CountryList = ({
  countries,
  labels,
  locale,
  value,
  texts,
  autoFocus,
  onSelect,
  onClose,
  classNames,
  styles: partStyles,
}: {
  countries: readonly Country[];
  labels: Labels;
  locale: string;
  value?: Country;
  texts: CountryPickerTexts;
  autoFocus: boolean;
  onSelect: (country: Country) => void;
  onClose: () => void;
  classNames?: Partial<Record<CountryPickerPart, string>>;
  styles?: Partial<Record<CountryPickerPart, CSSProperties>>;
}) => {
  const { styles, cx } = useStyles();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const options = useMemo(
    () => countryOptions({ countries, labels, locale, selected: value, query }),
    [countries, labels, locale, value, query]
  );
  const optionId = (index: number) => `${listId}-${index}`;
  const activeOption = options[active];

  // The highlighted country stays in view as the arrows move it.
  useEffect(() => {
    if (!activeOption) return;
    document
      .getElementById(`${listId}-${active}`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [listId, active, activeOption]);

  const move = (event: KeyboardEvent<HTMLInputElement>, next: number) => {
    event.preventDefault();
    if (options.length)
      setActive(Math.min(Math.max(next, 0), options.length - 1));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
        event.preventDefault();
        if (activeOption) onSelect(activeOption.country);
        return;
      case 'Escape':
        event.preventDefault();
        onClose();
        return;
    }
  };

  return (
    <div className={styles.list}>
      <Input
        autoFocus={autoFocus}
        allowClear
        type="search"
        size="large"
        role="combobox"
        value={query}
        placeholder={texts.search}
        aria-label={texts.search}
        aria-expanded
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption ? optionId(active) : undefined}
        className={classNames?.search}
        style={partStyles?.search}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label={texts.title}
        className={cx(styles.options, classNames?.list)}
        style={partStyles?.list}
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
            // The focus stays in the search field, which owns the list.
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActive(index)}
            onClick={() => onSelect(option.country)}
          >
            <CountryFlag country={option.country} title={option.name} />
            <span className={styles.optionName}>{option.name}</span>
            <span className={styles.optionCode}>+{option.callingCode}</span>
          </li>
        ))}
      </ul>
      {options.length === 0 ? (
        <Typography.Text
          type="secondary"
          role="status"
          className={cx(styles.empty, classNames?.empty)}
          style={partStyles?.empty}
        >
          {texts.empty}
        </Typography.Text>
      ) : null}
    </div>
  );
};

const useStyles = createStyles(({ css, cx, token }) => {
  const optionActive = css`
    background: ${token.colorFillTertiary};
  `;
  return {
    trigger: css`
      display: inline-flex;
      align-items: center;
      gap: ${token.marginXXS}px;
      height: 36px;
      padding: 0 ${token.paddingXS}px 0 ${token.paddingXS}px;
      border: 0;
      border-right: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px 0 0 ${token.borderRadius}px;
      background: transparent;
      color: ${token.colorTextTertiary};
      cursor: pointer;

      &:hover:not(:disabled) {
        background: ${token.colorFillSecondary};
      }

      &:disabled {
        cursor: default;
      }

      &:focus-visible {
        outline: 2px solid ${token.colorPrimaryBorder};
        outline-offset: 1px;
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
    sheet: css`
      display: flex;
      flex-direction: column;
      gap: ${token.paddingSM}px;
      padding: ${token.paddingSM}px ${token.padding}px
        calc(${token.padding}px + var(--safe-area-bottom, 0px));
    `,
    sheetTitle: css`
      font-size: ${token.fontSizeLG}px;
    `,
    list: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginXXS}px;
    `,
    options: css`
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 280px;
      overflow: auto;
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
    empty: css`
      padding: ${token.paddingXS}px;
    `,
  };
});
