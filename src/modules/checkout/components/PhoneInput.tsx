import { Button, Dropdown, InputRef } from 'antd';
import { createStyles } from 'antd-style';
import 'react-phone-number-input/style.css';
import PhoneInput, {
  Country,
} from 'react-phone-number-input/react-hook-form-input';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from '@src/components/UI/FloatingLabelInput';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useController } from 'react-hook-form';

const InputWrapper = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ placeholder, value, onChange, onFocus, onBlur, label, ...rest }, ref) => {
    const antRef = useRef<InputRef>(null);

    useImperativeHandle(ref, () => antRef.current?.input!, []);

    return (
      <FloatingLabelInput
        ref={antRef}
        label={label}
        placeholder={placeholder}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        {...rest}
      />
    );
  }
);

interface PhoneInputFieldProps extends FloatingLabelInputProps {
  control: any;
  name: string;
}

export const PhoneInputField = ({
  control,
  name,
  label,
  placeholder,
}: PhoneInputFieldProps) => {
  const defaultCountry: Country = 'UA';
  const countryFieldName = `${name}Country`;

  const { field: countryField } = useController<{ [k: string]: Country | undefined }>({
    name: countryFieldName,
    control,
  });

  const currentCountry: Country = (countryField.value as Country) || defaultCountry;

  useEffect(() => {
    if (!countryField.value) {
      countryField.onChange(defaultCountry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countries = getCountries();

  const items = countries.map((code) => ({
    key: code,
    label: `${(en as any)[code] ?? code} +${getCountryCallingCode(code)}`,
  }));

  const addonBefore = (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => countryField.onChange(key as Country),
      }}
      trigger={['click']}
    >
      <Button type="text">+{getCountryCallingCode(currentCountry)}</Button>
    </Dropdown>
  );

  return (
    <PhoneInput
      name={name}
      control={control}
      label={label}
      placeholder={placeholder}
      country={currentCountry}
      defaultCountry={defaultCountry}
      // international={false}
      international
      withCountryCallingCode
      inputComponent={InputWrapper}
      addonBefore={addonBefore}
      useNationalFormatForDefaultCountryValue={true}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  phoneInput: css`
    .PhoneInput {
      display: flex;
      align-items: center;
      gap: ${token.marginXS}px;
    }

    .PhoneInputInput {
      width: 100%;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      font-size: ${token.fontSize}px;
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;
      transition:
        border-color 0.3s,
        box-shadow 0.3s;
      height: 40px;
    }

    .PhoneInputInput:focus {
      border-color: ${token.colorPrimary};
      box-shadow: 0 0 0 2px ${token.colorPrimaryHover}33;
      outline: none;
    }
  `,
}));
