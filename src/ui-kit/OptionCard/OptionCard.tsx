"use client";

import { Button, ButtonProps, Checkbox, Radio } from "antd";
import { createStyles } from "antd-style";
import { ReactNode } from "react";
import clsx from "clsx";
import { TbChevronRight } from "react-icons/tb";

export interface OptionCardProps extends Omit<ButtonProps, "children"> {
  /** Main content of the card */
  children: ReactNode;
  /** Whether the card is selected */
  selected?: boolean;
  /** Whether the card is hovered (controlled externally) */
  hovered?: boolean;
  /** Type of control to render (if any) */
  control?: "radio" | "checkbox" | "chevron";
}

/**
 * Universal card for product options.
 * Supports various content types and controls.
 */
export const OptionCard = ({
  children,
  selected = false,
  hovered = false,
  control,
  className,
  variant = "outlined",
  ...buttonProps
}: OptionCardProps) => {
  const { styles } = useStyles();

  const renderControl = () => {
    if (!control) return null;

    if (control === "chevron") {
      return <TbChevronRight size={18} className={styles.control} />;
    }

    const controlElement =
      control === "checkbox" ? (
        <Checkbox checked={selected} className={styles.control} />
      ) : (
        <Radio checked={selected} className={styles.control} />
      );

    return controlElement;
  };

  return (
    <Button
      className={clsx(
        styles.container,
        control ? styles.justified : styles.centered,
        {
          "ant-btn-color-primary": selected,
          [styles.hovered]: hovered,
        },
        className
      )}
      variant={variant}
      color={selected ? "primary" : "default"}
      {...buttonProps}
    >
      {children}
      {renderControl()}
    </Button>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    align-items: center;
    padding: ${token.paddingXS}px;
    border-radius: ${token.borderRadius}px;
    transition: all 0.2s ease;
    width: 100%;
    height: unset;
    /* min-height: 48px; */
    gap: ${token.marginSM}px;

    /* Blue outline when selected */
    &.ant-btn-color-primary {
      box-shadow: 0 0 0 1px ${token.colorPrimary};
    }

    &:not(:disabled):hover {
      border-color: ${token.colorPrimary};
    }
  `,
  centered: css`
    justify-content: center;
  `,
  justified: css`
    justify-content: space-between;
    padding-right: ${token.paddingSM}px;
  `,
  hovered: css`
    border-color: ${token.colorPrimary};
  `,
  content: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    gap: ${token.marginXXS}px;
    flex: 1;
    text-align: left;
  `,
  control: css`
    display: flex;
    align-items: center;
    flex-shrink: 0;
  `,
  priceTag: css`
    margin: 0;
  `,
  chevronBtn: css`
    flex-shrink: 0;

    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
}));
