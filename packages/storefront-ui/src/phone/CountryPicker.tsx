'use client';

import { Input, Popover, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useId, useMemo, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { getCountryCallingCode } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { breakpoints } from '../breakpoints';
import { useMediaQuery } from '../useMediaQuery';
import { Vaul, useInsideDrawer } from '../drawer/Vaul';
import {
  countryLabels,
  countryOptions,
  type Country,
  type CountryOption,
} from './countries';

export interface CountryPickerTexts {
  /** Placeholder and accessible name of the search field. */
  search: string;
  /** Accessible name of the list and title of the sheet. */
  title: string;
  /** Shown when no country matches the search. */
  empty: string;
  /** Accessible name of the trigger: `{country}` and `{code}` are replaced. */
  trigger: string;
}

export const DEFAULT_COUNTRY_PICKER_TEXTS: CountryPickerTexts = {
  search: 'Search country',
  title: 'Choose a country',
  empty: 'No countries found',
  trigger: 'Country: {country}, +{code}',
};

export interface CountryPickerProps {
  value?: Country;
  onChange: (country: Country) => void;
  /** Countries to choose from. */
  countries: readonly Country[];
  /** Locale of the country names (`uk`, `ru`, `en`). */
  locale?: string;
  texts?: Partial<CountryPickerTexts>;
  disabled?: boolean;
  /** Controlled open state; uncontrolled by default. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** Below `md` the picker is a bottom sheet, nested in the drawer it is opened from. */
const PHONE_QUERY = `(max-width: ${breakpoints.md - 0.05}px)`;

export const CountryFlag = ({
  country,
  title,
  className,
}: {
  country?: Country;
  title?: string;
  className?: string;
}) => {
  const { styles, cx } = useStyles();
  const Flag = country ? flags[country] : undefined;
  return (
    <span className={cx(styles.flag, className)} aria-hidden>
      {Flag ? <Flag title={title ?? country ?? ''} /> : null}
    </span>
  );
};

/**
 * Country of a phone number: a flag button that opens a searchable list, the selected country
 * on top. A popover on desktop, a vaul bottom sheet on a phone.
 */
export const CountryPicker = ({
  value,
  onChange,
  countries,
  locale = 'en',
  texts: textOverrides,
  disabled,
  open: openProp,
  onOpenChange,
  className,
}: CountryPickerProps) => {
  const { styles, cx } = useStyles();
  const texts = { ...DEFAULT_COUNTRY_PICKER_TEXTS, ...textOverrides };
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const isPhone = useMediaQuery(PHONE_QUERY);
  const nested = useInsideDrawer();
  const labels = useMemo(() => countryLabels(locale), [locale]);
  const name = value ? (labels[value] ?? value) : '';
  const code = value ? getCountryCallingCode(value) : '';

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
      onSelect={select}
    />
  );

  const trigger = (
    <button
      type="button"
      className={cx(styles.trigger, className)}
      aria-label={texts.trigger
        .replace('{country}', name)
        .replace('{code}', code ?? '')}
      aria-haspopup="listbox"
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
        <Vaul
          open={open}
          onClose={() => setOpen(false)}
          dismissible
          direction="bottom"
          nested={nested}
        >
          <div className={styles.sheet}>
            <Typography.Text strong className={styles.sheetTitle}>
              {texts.title}
            </Typography.Text>
            {list}
          </div>
        </Vaul>
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
      content={<div className={styles.popover}>{list}</div>}
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
  onSelect,
}: {
  countries: readonly Country[];
  labels: ReturnType<typeof countryLabels>;
  locale: string;
  value?: Country;
  texts: CountryPickerTexts;
  onSelect: (country: Country) => void;
}) => {
  const { styles, cx } = useStyles();
  const [query, setQuery] = useState('');
  const listId = useId();
  const options = useMemo(
    () =>
      countryOptions({ countries, labels, locale, selected: value, query }),
    [countries, labels, locale, value, query]
  );

  return (
    <div className={styles.list}>
      <Input
        autoFocus
        allowClear
        type="search"
        size="large"
        value={query}
        placeholder={texts.search}
        aria-label={texts.search}
        aria-controls={listId}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && options[0]) {
            event.preventDefault();
            onSelect(options[0].country);
          }
        }}
      />
      <ul id={listId} role="listbox" aria-label={texts.title} className={styles.options}>
        {options.map((option: CountryOption) => (
          <li key={option.country}>
            <button
              type="button"
              role="option"
              aria-selected={option.country === value}
              className={cx(
                styles.option,
                option.country === value && styles.optionSelected
              )}
              onClick={() => onSelect(option.country)}
            >
              <CountryFlag country={option.country} title={option.name} />
              <span className={styles.optionName}>{option.name}</span>
              <span className={styles.optionCode}>+{option.callingCode}</span>
            </button>
          </li>
        ))}
      </ul>
      {options.length === 0 ? (
        <Typography.Text type="secondary" className={styles.empty}>
          {texts.empty}
        </Typography.Text>
      ) : null}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
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
    width: 100%;
    height: 40px;
    padding: 0 ${token.paddingXS}px;
    border: 0;
    border-radius: ${token.borderRadius}px;
    background: transparent;
    color: ${token.colorText};
    font: inherit;
    font-size: ${token.fontSize}px;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  optionSelected: css`
    background: ${token.colorPrimaryBg};

    &:hover {
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
}));

