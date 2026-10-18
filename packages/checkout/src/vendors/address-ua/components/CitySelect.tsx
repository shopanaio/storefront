import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettlementSearch } from '#checkout/vendors/nova-poshta/api/directory';
import { popularCities } from '#checkout/vendors/nova-poshta/popularCities';
import type { Settlement } from '#checkout/vendors/nova-poshta/types';
import { useSearchInput } from '#checkout/hooks/useDebouncedValue';
import { DirectoryNotice } from '#checkout/vendors/nova-poshta/components/DirectoryNotice';
import { CityOption } from './CityOption';
import { TbX } from 'react-icons/tb';
import {
  PiArrowCircleRightDuotone,
  PiArrowCircleRight,
  PiMapPinDuotone,
  PiMapPin,
} from 'react-icons/pi';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '#checkout/ui/DrawerBase';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';
import clsx from 'clsx';
import { useIsMobile } from '#checkout/ui/useIsMobile';

/** The picked city as the address keeps it: its name and the settlement hint. */
export interface PickedCity {
  name: string;
  settlementRef: string | null;
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
  const isMobile = useIsMobile();
  const t = useTranslations('Checkout');
  const [, token] = useToken();

  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const { searchTerm: searchValue, setSearchTerm: setSearchValue, debouncedTerm } =
    useSearchInput();
  const settlements = useSettlementSearch(isCityModalVisible ? debouncedTerm : '');

  const cityName = city?.name ?? null;
  useEffect(() => {
    setSearchValue(isCityModalVisible && cityName ? cityName : '');
  }, [isCityModalVisible, cityName, setSearchValue]);

  const handleSelectCity = (item: Settlement) => {
    onSubmit(item);
    setIsCityModalVisible(false);
  };

  const ArrowIcon = city ? PiArrowCircleRightDuotone : PiArrowCircleRight;
  const UserIcon = city ? PiMapPinDuotone : PiMapPin;
  return (
    <>
      <Button
        color={city ? 'primary' : 'default'}
        variant={'outlined'}
        onClick={() => setIsCityModalVisible(true)}
        icon={
          <UserIcon
            size={24}
            color={city ? token.colorPrimary : token.colorIcon}
          />
        }
        className={clsx(styles.button)}
      >
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          {city ? (
            <Flex vertical align="start" gap={4}>
              <Typography.Text
                className={styles.secondaryText}
                type="secondary"
              >
                {t('city')}
              </Typography.Text>
              <Typography.Text className={styles.mainText}>
                {city.name}
              </Typography.Text>
            </Flex>
          ) : (
            <Flex vertical align="start">
              <Typography.Text type="secondary">{t('city')}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t('select-city')}
              </Typography.Text>
            </Flex>
          )}
          <ArrowIcon
            color={city ? token.colorPrimary : token.colorIcon}
            size={24}
          />
        </Flex>
      </Button>
      <DrawerBase
        open={isCityModalVisible}
        onClose={() => setIsCityModalVisible(false)}
        engine={isMobile ? 'overlay' : 'vaul'}
        header={
          <DrawerBase.Header vertical gap={8}>
            <Flex
              gap={8}
              justify="space-between"
              align="center"
              style={{ width: '100%' }}
            >
              <DrawerBase.Title>{t('choose-your-city')}</DrawerBase.Title>
              <DrawerBase.CloseButton />
            </Flex>
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
          </DrawerBase.Header>
        }
      >
        <Flex vertical gap={16}>
          {!searchValue && (
            <Flex vertical gap={8} wrap>
              {popularCities.map((item) => (
                <Button
                  block
                  variant={item.ref === city?.settlementRef ? 'outlined' : 'text'}
                  color={item.ref === city?.settlementRef ? 'primary' : 'default'}
                  key={item.ref}
                  onClick={() => handleSelectCity(item)}
                  style={{ justifyContent: 'start' }}
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
              empty={debouncedTerm.trim().length > 0 && settlements.items.length === 0}
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
    button: css`
      display: flex;
      justify-content: start;
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
      min-height: 64px;
      height: 100%;
    `,
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
