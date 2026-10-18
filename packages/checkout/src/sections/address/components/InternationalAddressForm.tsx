'use client';

import { Flex, Select, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';
import { CheckoutEvent, onCheckoutEvent } from '#checkout/state/checkoutBus';
import type { AddressModuleProps, AddressModuleValue } from '#checkout/vendors/types';
import { addressRows, isValidPostalCode } from '../countries';
import type { AddressField, AddressFormat } from '../countries';

type Values = Record<AddressField, string>;

const EMPTY: Values = {
  FIRST_NAME: '',
  LAST_NAME: '',
  ADDRESS1: '',
  ADDRESS2: '',
  CITY: '',
  PROVINCE: '',
  POSTAL_CODE: '',
  PHONE: '',
};

const PROVINCE_LABEL_KEYS: Record<string, string> = {
  REGION: 'address-province-region',
  STATE: 'address-province-state',
  PROVINCE: 'address-province-province',
  COUNTY: 'address-province-county',
  OBLAST: 'address-province-oblast',
};

const POSTAL_CODE_LABEL_KEYS: Record<string, string> = {
  POSTAL_CODE: 'address-postal-code',
  ZIP_CODE: 'address-zip-code',
  POSTCODE: 'address-postcode',
};

/** Field errors of the form values: a missing required field or a postal code off pattern. */
export function addressErrors(
  format: AddressFormat,
  values: Values
): Partial<Record<AddressField, 'required' | 'invalid'>> {
  const errors: Partial<Record<AddressField, 'required' | 'invalid'>> = {};
  for (const field of addressRows(format).flat()) {
    const value = values[field].trim();
    if (!value) {
      if (format.required.includes(field)) errors[field] = 'required';
    } else if (field === 'POSTAL_CODE' && !isValidPostalCode(format, value)) {
      errors[field] = 'invalid';
    }
  }
  return errors;
}

/** Address the API takes from the form values; fields outside the format are left out. */
export function toAddressValue(
  countryCode: string,
  format: AddressFormat,
  values: Values
): AddressModuleValue {
  const fields = new Set(addressRows(format).flat());
  const value = (field: AddressField) =>
    fields.has(field) ? values[field].trim() || null : null;
  return {
    countryCode,
    city: values.CITY.trim(),
    address1: value('ADDRESS1'),
    address2: value('ADDRESS2'),
    provinceCode: value('PROVINCE'),
    postalCode: value('POSTAL_CODE'),
    data: {},
  };
}

/**
 * Address form of a country without its own address module, laid out by the country address
 * format (B6): rows, required fields, province list, postal code pattern. The address is saved
 * when a field is left and the form is complete; pressing "place order" marks every field.
 */
export function InternationalAddressForm({ address, country, onSubmit }: AddressModuleProps) {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const format = country.addressFormat;
  const saved = useMemo<Values>(
    () => ({
      ...EMPTY,
      ADDRESS1: address?.address1 ?? '',
      ADDRESS2: address?.address2 ?? '',
      CITY: address?.city ?? '',
      PROVINCE: address?.provinceCode ?? '',
      POSTAL_CODE: address?.postalCode ?? '',
    }),
    [address]
  );
  const [values, setValues] = useState<Values>(saved);
  const [touched, setTouched] = useState<Partial<Record<AddressField, boolean>>>({});
  // A newly saved address replaces what the form shows (the parent remounts it per country).
  // Compared by value: the saved address is a new object after every checkout read.
  const savedKey = JSON.stringify(saved);
  const [shownKey, setShownKey] = useState(savedKey);
  if (shownKey !== savedKey) {
    setShownKey(savedKey);
    setValues(saved);
    setTouched({});
  }

  const errors = addressErrors(format, values);
  const rows = addressRows(format);

  // Pressing "place order" shows what is missing in every field, not only in the visited ones.
  useEffect(
    () =>
      onCheckoutEvent(CheckoutEvent.SubmitRequested, () =>
        setTouched(Object.fromEntries(addressRows(format).flat().map((field) => [field, true])))
      ),
    [format]
  );

  const save = (next: Values) => {
    if (Object.keys(addressErrors(format, next)).length > 0) return;
    const value = toAddressValue(country.code, format, next);
    const current = toAddressValue(country.code, format, saved);
    if (address && JSON.stringify(value) === JSON.stringify(current)) return;
    onSubmit(value);
  };

  const leave = (field: AddressField, next: Values = values) => {
    setTouched((state) => ({ ...state, [field]: true }));
    save(next);
  };

  const label = (field: AddressField): string => {
    const text = (() => {
      switch (field) {
        case 'ADDRESS1':
          return t('address-line1');
        case 'ADDRESS2':
          return t('address-line2');
        case 'CITY':
          return t('city');
        case 'PROVINCE':
          return t(PROVINCE_LABEL_KEYS[format.provinceLabel ?? 'REGION']);
        default:
          return t(POSTAL_CODE_LABEL_KEYS[format.postalCodeLabel ?? 'POSTAL_CODE']);
      }
    })();
    return format.required.includes(field) ? text : t('address-optional', { label: text });
  };

  const errorText = (field: AddressField): string | undefined => {
    if (!touched[field] || !errors[field]) return undefined;
    if (errors[field] === 'required') return t('required-field');
    return format.postalCodeExample
      ? t('address-postal-code-invalid-example', { example: format.postalCodeExample })
      : t('address-postal-code-invalid');
  };

  const renderField = (field: AddressField) => {
    if (field === 'PROVINCE' && format.provinces.length > 0) {
      const error = errorText(field);
      return (
        <Flex key={field} vertical gap={4} className={styles.field}>
          <Select
            size="large"
            showSearch
            allowClear={!format.required.includes(field)}
            optionFilterProp="label"
            placeholder={label(field)}
            aria-label={label(field)}
            status={error ? 'error' : undefined}
            value={values.PROVINCE || undefined}
            options={format.provinces.map(({ code, name }) => ({ value: code, label: name }))}
            onChange={(value?: string) => {
              const next = { ...values, PROVINCE: value ?? '' };
              setValues(next);
              leave(field, next);
            }}
          />
          {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
        </Flex>
      );
    }
    return (
      <FloatingLabelInput
        key={field}
        wrapperClassName={styles.field}
        label={label(field)}
        value={values[field]}
        error={errorText(field)}
        autoComplete={AUTOCOMPLETE[field]}
        onChange={(event) => setValues({ ...values, [field]: event.target.value })}
        onBlur={() => leave(field)}
      />
    );
  };

  return (
    <Flex vertical gap={12}>
      {rows.map((row) => (
        <Flex key={row.join('-')} gap={12} className={styles.row}>
          {row.map(renderField)}
        </Flex>
      ))}
    </Flex>
  );
}

const AUTOCOMPLETE: Partial<Record<AddressField, string>> = {
  ADDRESS1: 'address-line1',
  ADDRESS2: 'address-line2',
  CITY: 'address-level2',
  PROVINCE: 'address-level1',
  POSTAL_CODE: 'postal-code',
};

const useStyles = createStyles(({ css }) => ({
  row: css`
    width: 100%;
  `,
  field: css`
    flex: 1;
    min-width: 0;
  `,
}));
