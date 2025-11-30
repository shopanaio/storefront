import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { client } from '@checkout/vendors/novaposta/api';
import type { SearchSettlementAddress } from '@shopana/novaposhta-api-client';
import { CityOption } from './CityOption';
import { TbX } from 'react-icons/tb';
import {
  PiArrowCircleRightDuotone,
  PiArrowCircleRight,
  PiMapPinDuotone,
  PiMapPin,
} from 'react-icons/pi';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '@src/ui-kit/DrawerBase';
import { FloatingLabelInput } from '@src/ui-kit/FloatingLabelInput';
import { popularCities } from '@checkout/vendors/novaposta/popularCities';
import clsx from 'clsx';
import { useIsMobile } from '@src/hooks/useIsMobile';

export type City = SearchSettlementAddress;

interface Prop {
  city: City | null;
  onSubmit: (city: City) => void;
}

export const CitySelect = ({ city, onSubmit }: Prop) => {
  const { styles } = useStyles();
  const isMobile = useIsMobile();
  const t = useTranslations('Checkout');
  const [, token] = useToken();

  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [settlements, setSettlements] = useState<City[]>([]);

  useEffect(() => {
    if (isCityModalVisible && city) {
      setSearchValue(city.MainDescription);
    } else if (!isCityModalVisible) {
      setSearchValue('');
    }
  }, [isCityModalVisible, city]);

  useEffect(() => {
    const fetchSettlements = async () => {
      if (searchValue.trim().length === 0) {
        setSettlements([]);
        return;
      }

      try {
        const result = await client.address.searchSettlements({
          CityName: searchValue,
          Limit: 20,
          Page: 1,
        });

        setSettlements(result.data?.[0]?.Addresses || []);
      } catch (error) {
        console.error('Error searching for settlements:', error);
        setSettlements([]);
      }
    };
    fetchSettlements();
  }, [searchValue]);

  const handleSelectCity = (item: City) => {
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
                {city.MainDescription}
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
                  variant={item.Ref === city?.Ref ? 'outlined' : 'text'}
                  color={item.Ref === city?.Ref ? 'primary' : 'default'}
                  key={item.Ref}
                  onClick={() => handleSelectCity(item)}
                  style={{ justifyContent: 'start' }}
                >
                  {item?.MainDescription}
                </Button>
              ))}
            </Flex>
          )}
          {searchValue && settlements?.length > 0 && (
            <Flex vertical gap={8}>
              {settlements.map((item) => (
                <CityOption
                  key={item.Ref}
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
