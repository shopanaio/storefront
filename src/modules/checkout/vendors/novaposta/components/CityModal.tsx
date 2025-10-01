import { Button, Divider, Flex, Input, Modal, Typography } from "antd";
import { createStyles } from "antd-style";
import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { City } from "@src/modules/checkout/Checkout";
import { NovaPoshta } from "../api/NovaPoshta";
import { searchSettlementsProperties } from "../api/NovaPoshta.types";
import { CityModalItem } from "./CityModalItem";

interface Prop {
  city: City | null;
  changeCity: (city: City) => void;
}

export const CityModal = ({ city, changeCity }: Prop) => {
  const { styles } = useStyles();
  const t = useTranslations("Checkout");

  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [settlements, setSettlements] = useState<City[]>([]);

  const apiKey = "";
  const np = new NovaPoshta(apiKey);

  useEffect(() => {
    const fetchSettlements = async () => {
      if (searchValue.trim().length === 0) return;

      try {
        const methodProperties: searchSettlementsProperties = {
          CityName: searchValue,
          Limit: "20",
          Page: "1",
        };

        const result = await np.searchSettlements(methodProperties);
        console.log(result.data[0].Addresses);
        setSettlements(result.data[0].Addresses || []);
      } catch (error) {
        console.error("Error searching for settlements:", error);
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
    setSearchValue("");
  };

  return (
    <>
      <Button
        className={styles.cityBtn}
        size="large"
        onClick={() => setIsCityModalVisible(true)}
      >
        {city ? (
          <Flex gap={5}>
            <Typography.Text>
              {`${city.SettlementTypeCode} ${city.MainDescription}`},
            </Typography.Text>
            <Typography.Text>
              {" "}
              {`${city.Area} ${city.ParentRegionCode}`}
            </Typography.Text>
          </Flex>
        ) : (
          <Typography.Text>{t("city")}</Typography.Text>
        )}
      </Button>

      <Modal
        open={isCityModalVisible}
        onCancel={() => setIsCityModalVisible(false)}
        footer={null}
      >
        <Flex vertical gap={16}>
          <Flex>
            <Typography.Text>{t("choose-your-city")}</Typography.Text>
          </Flex>

          <Divider className={styles.divider} />

          <Flex vertical gap={12}>
            <Flex vertical gap={8}>
              <Typography.Text>{t("choose-ua-city")}</Typography.Text>
              <Input
                placeholder={t("city")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Flex>

            <Flex vertical gap={8}>
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
        </Flex>
      </Modal>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    cityBtn: css`
      display: flex;
      justify-content: start;

      font-size: ${token.fontSizeLG}px;
    `,

    divider: css`
      margin: 0;
    `,
  };
});
