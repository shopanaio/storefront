import { Dropdown, Button } from "antd";
import { TbChevronDown } from "react-icons/tb";
import { MenuProps } from "antd";
import type { ButtonProps } from "antd";
import { createStyles } from "antd-style";

interface DropdownButtonProps {
  label: string;
  items: MenuProps["items"];
  onClick: MenuProps["onClick"];
  ButtonComponent?: React.ComponentType<ButtonProps>;
}

export const DropdownButton = ({
  label,
  items,
  onClick,
  ButtonComponent = Button,
}: DropdownButtonProps) => {
  const { styles } = useStyles();

  return (
    <Dropdown menu={{ items, onClick }} trigger={["click"]}>
      <ButtonComponent className={styles.dropdownBtn}>
        {label}
        <TbChevronDown />
      </ButtonComponent>
    </Dropdown>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    dropdownBtn: css`
      font-weight: var(--font-weight-500);
      font-size: ${token.fontSize}px;

      height: var(--components-header-control-height);
      border: none;
      box-shadow: none;
      padding: 0 ${token.paddingXS};
      color: ${token.colorText};
    `,
  };
});
