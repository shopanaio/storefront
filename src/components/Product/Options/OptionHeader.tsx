"use client";

import { Button, Flex, Tag, Typography } from "antd";
import { createStyles, css } from "antd-style";
import { TbChevronRight } from "react-icons/tb";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import type * as Entity from "@src/entity/namespace";
import { useHover } from "@src/components/UI/hooks/useHover";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { AmountTag } from "@src/components/Product/Options/AmountTag";

const { Text } = Typography;

interface OptionHeaderProps {
  title: string;
  onClick: () => void;
  /**
   * Selected option value or array of values (for multi-select groups).
   */
  value: UiOptionValue | UiOptionValue[] | null;
  /**
   * Optional image to render as preview thumbnail
   */
  cover?: Entity.Media | null;
}

export const OptionHeader = ({
  title,
  value,
  onClick,
  cover,
}: OptionHeaderProps) => {
  const { styles } = useStyles();
  const [isHovered, hoverHandlers] = useHover();
  // Collect captions considering possible individual pricing
  const selectedValues: UiOptionValue[] = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];

  return (
    <Flex
      className={styles.header}
      justify="space-between"
      align="center"
      onClick={onClick}
      {...hoverHandlers}
    >
      <Flex align="center" gap={8}>
        {cover && (
          <Thumbnail
            hovered={isHovered}
            src={cover.url}
            alt={selectedValues.map((v) => v.title).join(", ")}
            className={styles.cover}
          />
        )}
        <Flex vertical>
          <Text style={{ display: "flex", gap: 8 }}>{title}</Text>
          {selectedValues.length ? (
            <Flex vertical={selectedValues.length > 1}>
              {selectedValues.map((v, idx) => (
                <Text key={idx} className={styles.selectedTitle}>
                  {v.title}
                  {v.amount && <AmountTag money={v.amount} borderless />}
                </Text>
              ))}
            </Flex>
          ) : null}
        </Flex>
      </Flex>
      <Button
        className={styles.chevronButton}
        icon={<TbChevronRight />}
        onClick={onClick}
        size="large"
        variant="outlined"
        color={isHovered ? "primary" : "default"}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ token }) => ({
  header: css`
    cursor: pointer;
  `,
  chevronButton: css`
    transition: all 0.2s ease;
  `,
  cover: css`
    width: var(--thumb-size);
    height: var(--thumb-size);
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
    padding: ${token.paddingXXS}px;
    overflow: hidden;
  `,
  selectedTitle: css`
    display: flex;
    align-items: center;
    /* gap: 8px; */
    font-weight: 700;
    flex-wrap: wrap;
  `,
}));
