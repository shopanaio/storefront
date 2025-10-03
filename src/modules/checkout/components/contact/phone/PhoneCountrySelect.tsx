import { Button, Dropdown } from 'antd';
import { Country } from 'react-phone-number-input/react-hook-form-input';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en';

interface PhoneCountrySelectProps {
  /**
   * Currently selected country code
   */
  value: Country;
  /**
   * Callback when country is changed
   */
  onChange: (country: Country) => void;
}

/**
 * Dropdown component for selecting country phone code
 */
export const PhoneCountrySelect = ({ value, onChange }: PhoneCountrySelectProps) => {
  const countries = getCountries();

  const items = countries.map((code) => ({
    key: code,
    label: `${(en as any)[code] ?? code} +${getCountryCallingCode(code)}`,
  }));

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => onChange(key as Country),
      }}
      trigger={['click']}
    >
      <Button type="text">+{getCountryCallingCode(value)}</Button>
    </Dropdown>
  );
};
