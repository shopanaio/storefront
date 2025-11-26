import { Dropdown, Button, message } from "antd";
import { TbChevronDown } from "react-icons/tb";
import { MenuProps } from "antd";
import type { ButtonProps } from "antd";
import { createStyles } from "antd-style";

const handleLanguageClick: MenuProps["onClick"] = (e) => {
  message.info(`Clicked: ${e.key}`);
};

const items: MenuProps["items"] = [
  { label: "English (EN)", key: "en" },
  { label: "Ukrainian (UK)", key: "uk" },
  { label: "Russian (RU)", key: "ru" },
];

interface LanguageDropdownProps {
  label?: string;
  items?: MenuProps["items"];
  onClick?: MenuProps["onClick"];
  ButtonComponent?: React.ComponentType<ButtonProps>;
  buttonProps?: ButtonProps;
}

export const LanguageDropdown = ({
  label = "English (EN)",
  items: dropdownItems = items,
  onClick = handleLanguageClick,
  ButtonComponent = Button,
  buttonProps,
}: LanguageDropdownProps) => {
  const { styles } = useStyles();
  return (
    <Dropdown menu={{ items: dropdownItems, onClick }} trigger={["click"]}>
      <ButtonComponent className={styles.dropdownBtn} {...buttonProps}>
        {label}
        <TbChevronDown />
      </ButtonComponent>
    </Dropdown>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    dropdownBtn: css`
      display: flex;
      align-items: center;
      font-size: ${token.fontSize}px;
      color: ${token.colorText};
      height: 30px;
      border: none;
      box-shadow: none;
      padding: 0 ${token.paddingXS}px;
      color: ${token.colorText};
      gap: ${token.paddingXXS}px;
      background-color: transparent;
    `,
  };
});
