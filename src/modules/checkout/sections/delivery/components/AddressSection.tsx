'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { AddressForm as NovaPoshtaAddressForm } from '@src/modules/checkout/vendors/novaposta/components/forms/AddressForm';
import { WarehouseForm as NovaPoshtaWarehouseForm } from '@src/modules/checkout/vendors/novaposta/components/forms/WarehouseForm';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';

export type AddressCountry = 'UA' | 'INTL';

interface Prop {
  country: AddressCountry;
}

/**
 * Address section wrapper. For UA, reuses NovaPoshta city/street/warehouse modals.
 * For INTL, renders a simple generic address form.
 */
export const AddressSection = ({ country }: Prop) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const form = useFormContext();

  if (country === 'UA') {
    return (
      <Flex vertical gap={12} className={styles.container}>
        <NovaPoshtaAddressForm />
        <NovaPoshtaWarehouseForm />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={12} className={styles.container}>
      <FloatingLabelInput
        label={t('country-region')}
        value={form.watch('userCountry')}
        onChange={(e) => form.setValue('userCountry', e.target.value)}
      />
      <FloatingLabelInput
        label={t('address')}
        value={form.watch('userAddress1')}
        onChange={(e) => form.setValue('userAddress1', e.target.value)}
      />
      <FloatingLabelInput
        label={t('apartment-suite-etc-optional')}
        value={form.watch('userAddress2')}
        onChange={(e) => form.setValue('userAddress2', e.target.value)}
      />
      <Flex gap={12}>
        <FloatingLabelInput
          label={t('city')}
          value={form.watch('userCityIntl')}
          onChange={(e) => form.setValue('userCityIntl', e.target.value)}
        />
        <FloatingLabelInput
          label={t('state')}
          value={form.watch('userState')}
          onChange={(e) => form.setValue('userState', e.target.value)}
        />
      </Flex>
      <FloatingLabelInput
        label={t('zip-code')}
        value={form.watch('userZip')}
        onChange={(e) => form.setValue('userZip', e.target.value)}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default AddressSection;
