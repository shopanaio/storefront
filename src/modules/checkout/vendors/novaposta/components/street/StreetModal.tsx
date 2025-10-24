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
import { useIsMobile } from '@src/hooks/useIsMobile';

interface Prop {
  street: Street | null;
  changeStreet: (street: Street) => void;
  cityRef?: string;
}

const apiKey = '';
const np = new NovaPoshta(apiKey);

export const StreetModal = ({ street, changeStreet, cityRef }: Prop) => {
  const { styles } = useStyles();
  const isMobile = useIsMobile();
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

  useEffect(() => {
    if (1) {
      return;
    }

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
        engine={isMobile ? 'overlay' : 'vaul'}
        header={
          <DrawerBase.Header gap={8} justify="space-between" align="center">
            <FloatingLabelInput
              label={t('select-street')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={!cityRef}
            />
            <DrawerBase.CloseButton />
          </DrawerBase.Header>
        }
      >
        <Flex vertical>
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

const useStyles = createStyles(({ css }) => {
  return {
    divider: css`
      margin: 0;
    `,
  };
});
