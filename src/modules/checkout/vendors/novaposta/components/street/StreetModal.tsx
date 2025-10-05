import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useTranslations } from 'next-intl';
import { NovaPoshta } from '@src/utils/novaposhta-temp-api/NovaPoshta';
import { searchSettlementStreetsProperties } from '@src/utils/novaposhta-temp-api/NovaPoshta.types';
import { StreetModalItem } from './StreetModalItem';
import { SelectButton } from '@checkout/components/common/SelectButton';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import type { Street } from '@checkout/vendors/novaposta/types';

interface Prop {
  street: Street | null;
  changeStreet: (street: Street) => void;
  cityRef?: string;
}

const apiKey = '';
const np = new NovaPoshta(apiKey);

export const StreetModal = ({ street, changeStreet, cityRef }: Prop) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [isStreetModalVisible, setIsStreetModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [streets, setStreets] = useState<Street[]>([]);

  const debouncedFetchStreets = useMemo(
    () =>
      debounce(async (params: { cityRef?: string; search: string }) => {
        const { cityRef: ref, search } = params;
        if (!ref || search.trim().length === 0) {
          setStreets([]);
          return;
        }

        try {
          const methodProperties: searchSettlementStreetsProperties = {
            SettlementRef: ref,
            StreetName: search,
            Limit: '20',
          };

          const result = await np.searchSettlementStreets(methodProperties);
          setStreets(result.data?.[0]?.Addresses ?? []);
        } catch (error) {
          console.error('Error searching for streets:', error);
          setStreets([]);
        }
      }, 300),
    []
  );

  console.log('searchValue', searchValue);
  useEffect(() => {
    if (!cityRef || searchValue.trim().length === 0) {
      setStreets([]);
      debouncedFetchStreets.cancel();
      return;
    }

    debouncedFetchStreets({ cityRef, search: searchValue });

    return () => {
      debouncedFetchStreets.cancel();
    };
  }, [searchValue, cityRef, debouncedFetchStreets]);

  const handleSelectStreet = (item: Street) => {
    changeStreet(item);
    setIsStreetModalVisible(false);
    setSearchValue('');
  };

  return (
    <>
      <SelectButton
        hasValue={!!street}
        mainText={street?.Present}
        secondaryText={t('street')}
        placeholder={t('street')}
        onClick={() => setIsStreetModalVisible(true)}
        invert
        disabled={!cityRef}
      />
      <DrawerBase
        open={isStreetModalVisible}
        onClose={() => setIsStreetModalVisible(false)}
        title={t('select-street')}
      >
        <Flex vertical>
          <Flex className={styles.stickyBar}>
            <FloatingLabelInput
              label={t('street')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={!cityRef}
            />
          </Flex>
          <Flex vertical gap={8}>
            {streets.map((item) => (
              <StreetModalItem
                key={item.SettlementStreetRef}
                item={item}
                changeStreet={handleSelectStreet}
              />
            ))}
          </Flex>
        </Flex>
      </DrawerBase>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    divider: css`
      margin: 0;
    `,
    stickyBar: css`
      position: sticky;
      top: var(--components-drawer-header-height, 64px);
      z-index: 1;
      background: ${token.colorBgBase};
      padding-bottom: ${token.paddingSM}px;
    `,
  };
});
