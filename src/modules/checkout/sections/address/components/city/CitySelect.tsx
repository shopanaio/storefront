import { Button, Divider, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { NovaPoshta } from '@src/utils/novaposhta-temp-api/NovaPoshta';
import { searchSettlementsProperties } from '@src/utils/novaposhta-temp-api/NovaPoshta.types';
import type { City } from '@src/modules/checkout/vendors/novaposta/types';
import { CityOption } from './CityOption';
import { TbMapPin } from 'react-icons/tb';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { popularCities } from '@src/utils/novaposhta-temp-api/cities';
import clsx from 'clsx';
import { useIsMobile } from '@src/hooks/useIsMobile';

export type { City } from '@src/modules/checkout/vendors/novaposta/types';

interface Prop {
  city: City | null;
  onSubmit: (city: City) => void;
}

const np = new NovaPoshta('');

export const CitySelect = ({ city, onSubmit }: Prop) => {
  const { styles } = useStyles();
  const isMobile = useIsMobile();
  const t = useTranslations('Checkout');
  const [, token] = useToken();

  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [settlements, setSettlements] = useState<City[]>([]);

  useEffect(() => {
    const fetchSettlements = async () => {
      if (searchValue.trim().length === 0) return;

      try {
        const methodProperties: searchSettlementsProperties = {
          CityName: searchValue,
          Limit: '20',
          Page: '1',
        };

        const result = await np.searchSettlements(methodProperties);
        console.log(result.data[0].Addresses);
        setSettlements(result.data[0].Addresses || []);
      } catch (error) {
        console.error('Error searching for settlements:', error);
        setSettlements([]);
      }
    };
    fetchSettlements();
    return () => {
      setSettlements([]);
    };
  }, [searchValue, np]);

  const items = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    return normalized.length === 0
      ? settlements
      : settlements.filter(
          (item) =>
            item.MainDescription.toLowerCase().includes(normalized) ||
            item.Area.toLowerCase().includes(normalized)
        );
  }, [searchValue, settlements]);

  const handleSelectCity = (item: City) => {
    onSubmit(item);
    setIsCityModalVisible(false);
    setSearchValue('');
  };

  return (
    <>
      <Button
        color="default"
        variant={'outlined'}
        onClick={() => setIsCityModalVisible(true)}
        icon={<TbMapPin size={24} color={token.colorIcon} />}
        className={clsx(styles.button)}
      >
        {city ? (
          <Flex vertical align="start" gap={4}>
            <Typography.Text className={styles.secondaryText} type="secondary">
              {t('city')}
            </Typography.Text>
            <Typography.Text className={styles.mainText}>
              {city.MainDescription}
            </Typography.Text>
          </Flex>
        ) : (
          <Typography.Text type="secondary">{t('city')}</Typography.Text>
        )}
      </Button>
      <DrawerBase
        open={isCityModalVisible}
        onClose={() => setIsCityModalVisible(false)}
        title={t('choose-your-city')}
        engine={isMobile ? 'overlay' : 'vaul'}
        header={
          <DrawerBase.Header gap={8} justify="space-between" align="center">
            <FloatingLabelInput
              label={t('city')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <DrawerBase.CloseButton />
          </DrawerBase.Header>
        }
      >
        <Flex vertical>
          {!searchValue && (
            <>
              <Divider style={{ marginBottom: 12, marginTop: 0 }} />
              <Flex gap={8} wrap>
                {popularCities.map((item) => (
                  <Button
                    variant="outlined"
                    color="primary"
                    key={item.Ref}
                    onClick={() => handleSelectCity(item)}
                  >
                    {item?.MainDescription}
                  </Button>
                ))}
              </Flex>
            </>
          )}
          <Flex vertical gap={8}>
            {searchValue &&
              items.map((item) => (
                <CityOption
                  key={item.Ref}
                  item={item}
                  changeCity={handleSelectCity}
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
    button: css`
      display: flex;
      justify-content: start;
      padding: ${token.paddingXXS}px ${token.paddingLG}px ${token.paddingXXS}px
        ${token.paddingSM}px;
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
