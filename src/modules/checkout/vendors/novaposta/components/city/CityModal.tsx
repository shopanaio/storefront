import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { City } from '../../types';
import { NovaPoshta } from '../../api/NovaPoshta';
import { searchSettlementsProperties } from '../../api/NovaPoshta.types';
import { CityModalItem } from './CityModalItem';
import { SelectButton } from '../SelectButton';
import { TbMapPin } from 'react-icons/tb';
import useToken from 'antd/es/theme/useToken';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { popularCities } from '../../api/cities';

interface Prop {
  city: City | null;
  changeCity: (city: City) => void;
}

export const CityModal = ({ city, changeCity }: Prop) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const [, token] = useToken();

  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [settlements, setSettlements] = useState<City[]>([]);

  const apiKey = '';
  const np = new NovaPoshta(apiKey);

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
  }, [searchValue]);

  const items = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    return normalized.length === 0
      ? settlements
      : settlements.filter(
          (item) =>
            item.MainDescription.toLowerCase().includes(normalized) ||
            item.Area.toLowerCase().includes(normalized)
        );
  }, [searchValue]);

  console.log(items);

  const handleSelectCity = (item: City) => {
    changeCity(item);
    setIsCityModalVisible(false);
    setSearchValue('');
  };

  return (
    <>
      <SelectButton
        hasValue={!!city}
        mainText={
          city
            ? `${city.SettlementTypeCode} ${city.MainDescription}`
            : undefined
        }
        secondaryText={
          city ? `${city.Area} ${city.ParentRegionCode}` : undefined
        }
        placeholder={t('city')}
        onClick={() => setIsCityModalVisible(true)}
        icon={
          <TbMapPin
            size={24}
            color={city ? token.colorPrimary : token.colorIcon}
          />
        }
      />
      <DrawerBase
        open={isCityModalVisible}
        onClose={() => setIsCityModalVisible(false)}
        title={t('choose-your-city')}
      >
        <Flex vertical>
          <Flex className={styles.stickyBar}>
            <FloatingLabelInput
              label={t('city')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Flex>
          <Flex vertical gap={8}>
            {!searchValue && (
              <>
                <Typography.Text type="secondary">
                  {t('popular-cities')}
                </Typography.Text>
                {popularCities.map((item) => (
                  <CityModalItem
                    key={item.Ref}
                    item={item}
                    changeCity={handleSelectCity}
                  />
                ))}
              </>
            )}
            {searchValue &&
              items.map((item) => (
                <CityModalItem
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
