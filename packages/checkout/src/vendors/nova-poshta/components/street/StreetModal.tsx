import { Flex } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStreetSearch } from '../../api/directory';
import { StreetModalItem } from './StreetModalItem';
import { DirectoryNotice } from '../DirectoryNotice';
import { SelectButton } from '#checkout/components/common/SelectButton';
import { DrawerBase, FloatingLabelInput } from '@shopana/storefront-ui';
import { SearchDrawerHeader } from '#checkout/ui/SearchDrawerHeader';
import { useSearchInput } from '#checkout/hooks/useSearchInput';
import type { Street } from '../../types';

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
        // The list comes as the buyer types: the sheet keeps its height meanwhile.
        minHeight="60dvh"
        open={isStreetModalVisible}
        onClose={() => setIsStreetModalVisible(false)}
        header={
          <SearchDrawerHeader title={t('street')}>
            <FloatingLabelInput
              label={t('search_street')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!settlementRef}
            />
          </SearchDrawerHeader>
        }
      >
        <Flex vertical gap={4}>
          <DirectoryNotice
            loading={streets.loading}
            error={streets.error}
            empty={
              debouncedTerm.trim().length > 0 && streets.items.length === 0
            }
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
