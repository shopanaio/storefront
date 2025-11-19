import { Flex } from 'antd';
import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useTranslations } from 'next-intl';
import { client } from '../../api';
import type { SearchSettlementStreetsRequest } from '../../api';
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

export const StreetModal = ({ street, changeStreet, cityRef }: Prop) => {
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
          const request: SearchSettlementStreetsRequest = {
            settlementRef: ref,
            streetName: search,
            limit: 20,
          };

          const result = await client.address.searchSettlementStreets(request);
          setStreets(result.data?.[0]?.Addresses || []);
        } catch (error) {
          console.error('Error searching for streets:', error);
          setStreets([]);
        }
      }, 300),
    []
  );

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
        engine={isMobile ? 'overlay' : 'vaul'}
        header={
          <DrawerBase.Header vertical gap={8}>
            <Flex gap={8} justify="space-between" align="center" style={{ width: '100%' }}>
              <DrawerBase.Title>{t('street')}</DrawerBase.Title>
              <DrawerBase.CloseButton />
            </Flex>
            <FloatingLabelInput
              label={t('select-street')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={!cityRef}
            />
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
