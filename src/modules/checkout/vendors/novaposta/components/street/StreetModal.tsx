import { Divider, Flex, Input, Modal, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { NovaPoshta } from '../../api/NovaPoshta';
import { searchSettlementStreetsProperties } from '../../api/NovaPoshta.types';
import { StreetModalItem } from './StreetModalItem';
import { SelectButton } from '../SelectButton';

interface Street {
  Present: string;
  SettlementRef: string;
  SettlementStreetDescription: string;
  SettlementStreetDescriptionRu: string;
  SettlementStreetRef: string;
  StreetsType: string;
  StreetsTypeDescription: string;
}

interface Prop {
  street: Street | null;
  changeStreet: (street: Street) => void;
  cityRef?: string;
}

export const StreetModal = ({ street, changeStreet, cityRef }: Prop) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [isStreetModalVisible, setIsStreetModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [streets, setStreets] = useState<Street[]>([]);

  const apiKey = '';
  const np = new NovaPoshta(apiKey);

  useEffect(() => {
    const fetchStreets = async () => {
      if (!cityRef || searchValue.trim().length === 0) return;

      try {
        const methodProperties: searchSettlementStreetsProperties = {
          SettlementRef: cityRef,
          StreetName: searchValue,
          Limit: '20',
        };

        const result = await np.searchSettlementStreets(methodProperties);
        setStreets(result.data[0].Addresses || []);
      } catch (error) {
        console.error('Error searching for streets:', error);
        setStreets([]);
      }
    };

    fetchStreets();
  }, [searchValue, cityRef]);

  const items = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    return normalized.length === 0
      ? streets
      : streets.filter((item) =>
          item.Present.toLowerCase().includes(normalized)
        );
  }, [searchValue, streets]);

  console.log(items);

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
      <Modal
        open={isStreetModalVisible}
        onCancel={() => setIsStreetModalVisible(false)}
        footer={null}
      >
        <Flex vertical gap={16}>
          <Flex>
            <Typography.Text>{t('select-street')}</Typography.Text>
          </Flex>
          <Divider className={styles.divider} />
          <Flex vertical gap={12}>
            <Flex vertical gap={8}>
              <Typography.Text>{t('select')}</Typography.Text>
              <Input
                placeholder={t('street')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                disabled={!cityRef}
              />
            </Flex>

            <Flex vertical gap={8}>
              {searchValue &&
                items.map((item) => (
                  <StreetModalItem
                    key={item.SettlementStreetRef}
                    item={item}
                    changeStreet={handleSelectStreet}
                  />
                ))}
            </Flex>
          </Flex>
        </Flex>
      </Modal>
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
