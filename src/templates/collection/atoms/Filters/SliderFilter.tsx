import React from "react";
import { Flex, Slider, InputNumber } from "antd";
import { createStyles } from "antd-style";

interface SliderFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
}

export const SliderFilter: React.FC<SliderFilterProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  const { styles } = useStyles();

  console.log(min, "MIN");

  return (
    <Flex vertical gap={8}>
      <Slider
        range
        value={value}
        min={min}
        max={max}
        onChange={(val) => onChange(val as [number, number])}
      />
      <Flex gap={10} align="center">
        <InputNumber
          className={styles.priceInput}
          min={min}
          max={value[1]}
          value={value[0]}
          onChange={(val) =>
            val !== null && onChange([val as number, value[1]])
          }
        />
        <InputNumber
          className={styles.priceInput}
          min={value[0]}
          max={max}
          value={value[1]}
          onChange={(val) =>
            val !== null && onChange([value[0], val as number])
          }
        />
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  priceInput: css`
    width: 100%;
  `,
  applyPrice: css`
    max-width: fit-content;
  `,
}));
