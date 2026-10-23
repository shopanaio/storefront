import { Button, Flex, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettlementSearch } from '#checkout/vendors/nova-poshta/api/directory';
import { popularCities } from '#checkout/vendors/nova-poshta/popularCities';
import type { Settlement } from '#checkout/vendors/nova-poshta/types';
import { useSearchInput } from '#checkout/hooks/useSearchInput';
import { DirectoryNotice } from '#checkout/vendors/nova-poshta/components/DirectoryNotice';
import { CityOption } from './CityOption';
import { TbX } from 'react-icons/tb';
import { PiMapPinDuotone, PiMapPin } from 'react-icons/pi';
import { SelectCard } from '#checkout/ui/SelectCard';
import { DrawerBase, FloatingLabelInput } from '@shopana/storefront-ui';
import { SearchDrawerHeader } from '#checkout/ui/SearchDrawerHeader';

/** The picked city as the address keeps it: its name, its oblast and the settlement hint. */
export interface PickedCity {
  name: string;
  settlementRef: string | null;
  /** Name of the oblast, shown under the city; `null` when unknown or the city has its own. */
  area?: string | null;
}

interface Prop {
  city: PickedCity | null;
  onSubmit: (settlement: Settlement) => void;
}

/**
 * City of a Ukrainian address, searched in the Nova Poshta directory: the settlement it
 * returns serves as the carrier hint of the address.
 */
export const CitySelect = ({ city, onSubmit }: Prop) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { token } = theme.useToken();

  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const {
    searchTerm: searchValue,
    setSearchTerm: setSearchValue,
    debouncedTerm,
  } = useSearchInput();
  const settlements = useSettlementSearch(
    isCityModalVisible ? debouncedTerm : ''
  );

  const cityName = city?.name ?? null;
  useEffect(() => {
    setSearchValue(isCityModalVisible && cityName ? cityName : '');
  }, [isCityModalVisible, cityName, setSearchValue]);

  const handleSelectCity = (item: Settlement) => {
    // The same city again changes nothing: no save and no delivery reload (SC-fobt).
    if (item.ref !== city?.settlementRef) {
      onSubmit(item);
    }
    setIsCityModalVisible(false);
  };

  const UserIcon = city ? PiMapPinDuotone : PiMapPin;
  return (
    <>
      <SelectCard
        label={t('city')}
        labelShown={!city}
        selected={!!city}
        action={city ? t('change') : t('select')}
        onClick={() => setIsCityModalVisible(true)}
        icon={
          <UserIcon
            size={24}
            color={city ? token.colorPrimary : token.colorIcon}
          />
        }
      >
        {city ? (
          // The city, and its oblast under it when the store lists it.
          <Flex vertical align="start" gap={4}>
            <Typography.Text className={styles.mainText}>
              {city.name}
            </Typography.Text>
            {city.area ? (
              <Typography.Text
                className={styles.secondaryText}
                type="secondary"
              >
                {city.area}
              </Typography.Text>
            ) : null}
          </Flex>
        ) : (
          <Flex vertical align="start">
            <Typography.Text type="secondary">{t('city')}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {t('select-city')}
            </Typography.Text>
          </Flex>
        )}
      </SelectCard>
      <DrawerBase
        // The list comes as the buyer types: the sheet keeps its height meanwhile.
        minHeight="60dvh"
        open={isCityModalVisible}
        onClose={() => setIsCityModalVisible(false)}
        header={
          <SearchDrawerHeader title={t('choose-your-city')}>
            <FloatingLabelInput
              label={t('city')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              suffix={
                searchValue && (
                  <TbX
                    size={20}
                    color={token.colorIcon}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchValue('')}
                  />
                )
              }
            />
          </SearchDrawerHeader>
        }
      >
        <Flex vertical gap={16}>
          {!searchValue && (
            // Popular cities as pills in a row, wrapping; the chosen one in the primary color.
            <Flex gap={8} wrap>
              {popularCities.map((item) => (
                <Button
                  size="large"
                  shape="round"
                  variant="outlined"
                  color={
                    item.ref === city?.settlementRef ? 'primary' : 'default'
                  }
                  key={item.name}
                  // A city without a ref is searched for by name, and picked from the results.
                  onClick={() =>
                    item.ref
                      ? handleSelectCity(item)
                      : setSearchValue(item.name)
                  }
                >
                  {item.name}
                </Button>
              ))}
            </Flex>
          )}
          {searchValue && (
            <DirectoryNotice
              loading={settlements.loading}
              error={settlements.error}
              empty={
                debouncedTerm.trim().length > 0 &&
                settlements.items.length === 0
              }
              onRetry={settlements.retry}
            />
          )}
          {searchValue && settlements.items.length > 0 && (
            <Flex vertical gap={8}>
              {settlements.items.map((item) => (
                <CityOption
                  key={item.ref}
                  item={item}
                  changeCity={handleSelectCity}
                />
              ))}
            </Flex>
          )}
        </Flex>
      </DrawerBase>
    </>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    invert: css`
      flex-direction: column-reverse;
    `,
    mainText: css`
      max-width: 300px !important;
      line-height: 1;
      font-size: ${token.fontSize}px;
    `,
    secondaryText: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1;
    `,
  };
});
