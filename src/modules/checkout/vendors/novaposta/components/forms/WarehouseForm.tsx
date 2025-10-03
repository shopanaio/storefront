'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { WarehouseModal } from '../warehouse/WarehouseModal';

export function WarehouseForm() {
  const { styles } = useStyles();
  const form = useFormContext();
  const t = useTranslations('Modules.novaposta.form');

  const citySelected = Boolean(form.watch('userCity'));

  return (
    <Flex vertical gap={12} className={styles.container}>
      <WarehouseModal
        warehouse={form.watch('userWarehouse')}
        changeWarehouse={(w) => form.setValue('userWarehouse', w)}
        cityName={form.watch('userCity')?.MainDescription}
      />
      {!citySelected && (
        <Alert
          message={t('city_required_warning')}
          type="warning"
          showIcon
        />
      )}
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default WarehouseForm;
