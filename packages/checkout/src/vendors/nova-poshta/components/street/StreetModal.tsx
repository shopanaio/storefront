import { Flex } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStreetSearch } from '../../api/directory';
import { StreetModalItem } from './StreetModalItem';
import { DirectoryNotice } from '../DirectoryNotice';
import { SelectButton } from '#checkout/components/common/SelectButton';
import { DrawerBase } from '#checkout/ui/DrawerBase';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';
import { useSearchInput } from '#checkout/hooks/useSearchInput';
import type { Street } from '../../types';
import { useIsMobile } from '#checkout/ui/useIsMobile';

interface Prop {
  /** Label of the picked street. */
  streetPresent: string | null;
  changeStreet: (street: Street) => void;
  settlementRef: string | null;
}

export const StreetModal = ({
  streetPresent,
  changeStreet,
  settlementRef,
}: Prop) => {
  const isMobile = useIsMobile();
  const t = useTranslations('Modules.novaPoshta.form');

  const [isStreetModalVisible, setIsStreetModalVisible] = useState(false);
  const { searchTerm, setSearchTerm, debouncedTerm } = useSearchInput();
  const streets = useStreetSearch(
    isStreetModalVisible ? settlementRef : null,
    debouncedTerm
  );

  const handleSelectStreet = (item: Street) => {
    changeStreet(item);
    setIsStreetModalVisible(false);
    setSearchTerm('');
  };

  return (
    <>
      <SelectButton
        hasValue={!!streetPresent}
        mainText={streetPresent ?? undefined}
        secondaryText={t('street')}
        placeholder={t('street')}
        onClick={() => setIsStreetModalVisible(true)}
        invert
        disabled={!settlementRef}
      />
      <DrawerBase
        open={isStreetModalVisible}
        onClose={() => setIsStreetModalVisible(false)}
        engine={isMobile ? 'overlay' : 'vaul'}
        header={
          <DrawerBase.Header vertical gap={8}>
            <Flex
              gap={8}
              justify="space-between"
              align="center"
              style={{ width: '100%' }}
            >
              <DrawerBase.Title>{t('street')}</DrawerBase.Title>
              <DrawerBase.CloseButton />
            </Flex>
            <FloatingLabelInput
              label={t('search_street')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!settlementRef}
            />
          </DrawerBase.Header>
        }
      >
        <Flex vertical gap={4}>
          <DirectoryNotice
            loading={streets.loading}
            error={streets.error}
            empty={debouncedTerm.trim().length > 0 && streets.items.length === 0}
            onRetry={streets.retry}
          />
          {streets.items.map((item) => (
            <StreetModalItem
              key={item.ref}
              item={item}
              changeStreet={handleSelectStreet}
            />
          ))}
        </Flex>
      </DrawerBase>
    </>
  );
};
