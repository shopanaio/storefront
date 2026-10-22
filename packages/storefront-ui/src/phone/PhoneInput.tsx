'use client';

import type { InputRef } from 'antd/es/input';
import { createStyles } from 'antd-style';
import {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import type { FocusEventHandler, ReactNode } from 'react';
import PhoneInputWithCountrySelect, {
  getCountries,
} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import {
  FloatingLabelInput,
  type FloatingLabelInputProps,
} from '../FloatingLabelInput';
import { CountryPicker, type CountryPickerTexts } from './CountryPicker';
import { countryLabels, type Country } from './countries';

export interface PhoneInputProps {
  /** E.164 (`+380501234567`), what `onChange` gives back; empty while incomplete. */
  value?: string;
  onChange: (value: string | undefined) => void;
  label: string;
  error?: string;
  status?: 'error' | 'warning';
  /** Country of an empty field; Ukraine by default. */
  defaultCountry?: Country;
  /** Locale of the country names in the picker. */
  locale?: string;
  pickerTexts?: Partial<CountryPickerTexts>;
  /** Controlled open state of the country picker; uncontrolled by default. */
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Shown at the end of the field, e.g. a lock of a read-only number. */
  suffix?: ReactNode;
  autoFocus?: boolean;
  autoComplete?: string;
  name?: string;
  id?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  wrapperClassName?: string;
  'aria-describedby'?: string;
}

interface PickerSettings {
  locale: string;
  texts?: Partial<CountryPickerTexts>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PickerSettingsContext = createContext<PickerSettings>({ locale: 'en' });

/**
 * International phone number in the floating-label field: the country flag inside the field on
 * the left, the number with its calling code after it (`+380 67 123 45 67`). The value is E.164,
 * ready for the API; check it with `isPossiblePhoneNumber`.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      defaultCountry = 'UA',
      locale = 'en',
      pickerTexts,
      pickerOpen,
      onPickerOpenChange,
      wrapperClassName,
      disabled,
      readOnly,
      ...fieldProps
    },
    ref
  ) => {
    const { styles, cx } = useStyles();
    const labels = useMemo(() => countryLabels(locale), [locale]);
    const settings = useMemo(
      () => ({
        locale,
        texts: pickerTexts,
        open: pickerOpen,
        onOpenChange: onPickerOpenChange,
      }),
      [locale, pickerTexts, pickerOpen, onPickerOpenChange]
    );

    return (
      <PickerSettingsContext.Provider value={settings}>
        <PhoneInputWithCountrySelect
          // The library forwards the ref to the number input.
          ref={ref as never}
          value={value ?? ''}
          onChange={onChange}
          defaultCountry={defaultCountry}
          international
          countryCallingCodeEditable={false}
          focusInputOnCountrySelection
          labels={labels}
          flags={flags}
          disabled={disabled}
          readOnly={readOnly}
          className={cx(styles.container, wrapperClassName)}
          containerComponent={PhoneContainer}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneField}
          {...fieldProps}
        />
      </PickerSettingsContext.Provider>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

const PhoneContainer = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: object;
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
  options,
  disabled,
  readOnly,
}: {
  value?: Country;
  onChange: (country?: Country) => void;
  options: { value?: Country; label: string; divider?: boolean }[];
  disabled?: boolean;
  readOnly?: boolean;
}) => {
  const { styles } = useStyles();
  const settings = useContext(PickerSettingsContext);
  const countries = useMemo(
    () =>
      options
        .map((option) => option.value)
        .filter((country): country is Country => Boolean(country)),
    [options]
  );
  return (
    <span className={styles.country}>
      <CountryPicker
        value={value}
        onChange={onChange}
        countries={countries.length ? countries : getCountries()}
        locale={settings.locale}
        texts={settings.texts}
        open={settings.open}
        onOpenChange={settings.onOpenChange}
        disabled={disabled || readOnly}
      />
    </span>
  );
};

/** `inputComponent` of the library: the floating-label field, room for the flag in front. */
const PhoneField = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  (props, ref) => {
    const { styles } = useStyles();
    const inputRef = useRef<InputRef>(null);
    useImperativeHandle(ref, () => inputRef.current?.input as HTMLInputElement, []);
    return (
      <FloatingLabelInput
        ref={inputRef}
        {...props}
        type="tel"
        inputMode="tel"
        prefix={<span className={styles.flagRoom} aria-hidden />}
      />
    );
  }
);

PhoneField.displayName = 'PhoneField';

const useStyles = createStyles(({ css }) => ({
  container: css`
    position: relative;
    width: 100%;
  `,
  // Over the field, as tall as it (50px), in the room the field leaves at its start.
  country: css`
    position: absolute;
    z-index: 3;
    top: 0;
    left: 1px;
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 3px;
  `,
  flagRoom: css`
    display: inline-block;
    width: 52px;
  `,
}));
