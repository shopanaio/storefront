'use client';

import type { InputRef } from 'antd';
import { createStyles } from 'antd-style';
import { useImperativeHandle, useMemo, useRef } from 'react';
import type { ComponentType, CSSProperties, ReactNode, Ref } from 'react';
import PhoneInputWithCountrySelect, {
  getCountries,
} from 'react-phone-number-input';
import type {
  FeatureProps,
  Props as LibraryProps,
  Value,
} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import {
  FLOATING_FIELD_HEIGHT,
  FloatingLabelInput,
  type FloatingLabelInputProps,
} from '../FloatingLabelInput';
import {
  useStorefrontUI,
  type CountryPickerTexts,
} from '../StorefrontUIProvider';
import { CountryPicker } from './CountryPicker';
import { useCountryLabels, type Country } from './countries';

/** The floating-label field without what the phone input sets itself. */
type PhoneFieldProps = Omit<
  FloatingLabelInputProps,
  | 'ref'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'type'
  | 'inputMode'
  | 'prefix'
  | 'className'
  | 'style'
>;

export interface PhoneInputProps extends Omit<
  FeatureProps<PhoneFieldProps>,
  | 'countries'
  | 'labels'
  | 'locales'
  | 'flags'
  | 'flagUrl'
  | 'flagComponent'
  | 'international'
  | 'countryCallingCodeEditable'
  | 'countrySelectComponent'
  | 'countrySelectProps'
  | 'inputComponent'
  | 'containerComponent'
  | 'containerComponentProps'
  | 'internationalIcon'
  | 'addInternationalOption'
  | 'countryOptionsOrder'
  | 'className'
  | 'style'
> {
  /** The number input. */
  ref?: Ref<HTMLInputElement>;
  /** E.164 (`+380501234567`), what `onChange` gives back; empty while incomplete. */
  value?: string;
  onChange: (value: string | undefined) => void;
  /** Countries of the picker; every country by default. */
  countries?: readonly Country[];
  /** Country of an empty field; the `phoneCountry` of `StorefrontUIProvider` by default. */
  defaultCountry?: Country;
  /** Locale of the country names; the one of `StorefrontUIProvider`. */
  locale?: string;
  /** Texts of the country picker over the ones of `StorefrontUIProvider`. */
  pickerTexts?: Partial<CountryPickerTexts>;
  /** Controlled open state of the country picker; uncontrolled by default. */
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  /** Shown at the end of the field, e.g. a lock of a read-only number. */
  suffix?: ReactNode;
  /** The box of the picker and the field; `classNames` and `styles` go to the field's parts. */
  className?: string;
  style?: CSSProperties;
}

/** What `CountrySelect` gets through the library's `countrySelectProps`. */
interface CountrySelectSettings {
  locale: string;
  countries?: readonly Country[];
  texts?: Partial<CountryPickerTexts>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// The library's component class does not type the ref it forwards to the number input.
const PhoneNumberInput =
  PhoneInputWithCountrySelect as unknown as ComponentType<
    LibraryProps<PhoneFieldProps> & { ref?: Ref<HTMLInputElement> }
  >;

/**
 * International phone number in the floating-label field: the country flag inside the field on
 * the left, the number with its calling code after it (`+380 67 123 45 67`). The value is E.164,
 * ready for the API; check it with `isPossiblePhone` or `isValidPhone`.
 */
export const PhoneInput = ({
  ref,
  value,
  onChange,
  countries,
  defaultCountry,
  locale: localeProp,
  pickerTexts,
  pickerOpen,
  onPickerOpenChange,
  className,
  style,
  ...fieldProps
}: PhoneInputProps) => {
  const { styles, cx } = useStyles();
  const ui = useStorefrontUI();
  const locale = localeProp ?? ui.locale;
  const labels = useCountryLabels(locale);
  const countrySelectProps = useMemo<CountrySelectSettings>(
    () => ({
      locale,
      countries,
      texts: pickerTexts,
      open: pickerOpen,
      onOpenChange: onPickerOpenChange,
    }),
    [locale, countries, pickerTexts, pickerOpen, onPickerOpenChange]
  );

  return (
    <PhoneNumberInput
      {...fieldProps}
      ref={ref}
      value={value ?? ''}
      onChange={(next?: Value) => onChange(next)}
      defaultCountry={defaultCountry ?? ui.phoneCountry}
      countries={countries ? [...countries] : undefined}
      international
      countryCallingCodeEditable={false}
      focusInputOnCountrySelection
      labels={labels}
      flags={flags}
      className={cx(styles.container, className)}
      style={style}
      containerComponent={PhoneContainer}
      countrySelectComponent={CountrySelect}
      countrySelectProps={countrySelectProps}
      inputComponent={PhoneField}
    />
  );
};

const PhoneContainer = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <div className={className} style={style}>
    {children}
  </div>
);

/** `countrySelectComponent` of the library: the picker over the start of the field. */
const CountrySelect = ({
  value,
  onChange,
  disabled,
  readOnly,
  locale,
  countries,
  texts,
  open,
  onOpenChange,
}: CountrySelectSettings & {
  value?: Country;
  onChange: (country?: Country) => void;
  disabled?: boolean;
  readOnly?: boolean;
}) => {
  const { styles } = useStyles();
  const all = useMemo(() => getCountries(), []);
  return (
    <span className={styles.country}>
      <CountryPicker
        value={value}
        onChange={onChange}
        countries={countries ?? all}
        locale={locale}
        texts={texts}
        open={open}
        onOpenChange={onOpenChange}
        disabled={disabled || readOnly}
      />
    </span>
  );
};

/** `inputComponent` of the library: the floating-label field, room for the flag in front. */
const PhoneField = ({
  ref,
  ...props
}: PhoneFieldProps & { ref?: Ref<HTMLInputElement> }) => {
  const { styles } = useStyles();
  const inputRef = useRef<InputRef>(null);
  useImperativeHandle(
    ref,
    () => inputRef.current?.input as HTMLInputElement,
    []
  );
  return (
    <FloatingLabelInput
      ref={inputRef}
      {...props}
      type="tel"
      inputMode="tel"
      prefix={<span className={styles.flagRoom} aria-hidden />}
    />
  );
};

/** Room the field leaves at its start for the picker: the flag, the chevron and their padding. */
const PICKER_WIDTH = 52;

const useStyles = createStyles(({ css }) => ({
  container: css`
    position: relative;
    width: 100%;
  `,
  // Over the field, as tall as it, in the room the field leaves at its start.
  country: css`
    position: absolute;
    z-index: 3;
    top: 0;
    left: 1px;
    height: ${FLOATING_FIELD_HEIGHT}px;
    display: flex;
    align-items: center;
    padding-left: 3px;
  `,
  flagRoom: css`
    display: inline-block;
    width: ${PICKER_WIDTH}px;
  `,
}));
