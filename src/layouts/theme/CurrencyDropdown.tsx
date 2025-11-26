import { Dropdown, Button, message } from "antd";
import { TbChevronDown } from "react-icons/tb";
import { MenuProps } from "antd";
import { createStyles } from "antd-style";
import { useCurrencyStore } from "@src/store/appStore";
import { CurrencyCode } from "@codegen/schema-client";

const currencyLabels: Record<CurrencyCode, string> = {
  [CurrencyCode.Uah]: "Hryvnia (UAH ₴)",
  [CurrencyCode.Usd]: "Dollar (USD $)",
  [CurrencyCode.Eur]: "Euro (EUR €)",
};

const items: MenuProps["items"] = [
  { label: currencyLabels[CurrencyCode.Uah], key: CurrencyCode.Uah },
  { label: currencyLabels[CurrencyCode.Usd], key: CurrencyCode.Usd },
  { label: currencyLabels[CurrencyCode.Eur], key: CurrencyCode.Eur },
];

export const CurrencyDropdown = () => {
  const currencyCode = useCurrencyStore((state) => state.currencyCode);
  const setCurrencyCode = useCurrencyStore((state) => state.setCurrencyCode);
  const { styles } = useStyles();

  const handleClick: MenuProps["onClick"] = (e) => {
    const selected = e.key as CurrencyCode;
    setCurrencyCode(selected);
    message.success(`Currency changed to: ${currencyLabels[selected]}`);
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={["click"]}>
      <Button className={styles.dropdownBtn}>
        {currencyLabels[currencyCode]}
        <TbChevronDown />
      </Button>
    </Dropdown>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  dropdownBtn: css`
    display: flex;
    align-items: center;
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
    height: 30px;
    border: none;
    box-shadow: none;
    padding: 0 ${token.paddingXS}px;
    gap: ${token.paddingXXS}px;
    background-color: transparent;
  `,
}));
