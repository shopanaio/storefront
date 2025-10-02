'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { CityModal } from '../city/CityModal';
import { StreetModal } from '../street/StreetModal';

export function AddressForm() {
  const { styles } = useStyles();
  const form = useFormContext();
  const t = useTranslations('Modules.novaposta.form');

  return (
    <Flex vertical gap={12} className={styles.container}>
      <CityModal
        city={form.watch('userCity')}
        changeCity={(c) => form.setValue('userCity', c)}
      />
      <StreetModal
        street={form.watch('userStreet')}
        changeStreet={(s) => form.setValue('userStreet', s)}
        cityRef={form.watch('userCity')?.Ref}
      />
      <Flex gap={12}>
        <FloatingLabelInput
          label={t('building')}
          value={form.watch('userBuilding')}
          onChange={(e) => form.setValue('userBuilding', e.target.value)}
        />
        <FloatingLabelInput
          label={t('apartment')}
          value={form.watch('userApartment')}
          onChange={(e) => form.setValue('userApartment', e.target.value)}
        />
      </Flex>
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default AddressForm;
