"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { ShowMoreBtn } from "./ShowMoreBtn";
import { ProductCollapse } from "./ProductCollapse";
import { ApiProductFeature } from "@codegen/schema-client";

const { Text } = Typography;

interface Prop {
  features: ApiProductFeature[];
}

export const ProductSpecification = ({ features }: Prop) => {
  const { styles } = useStyles();

  if (!features?.length) {
    return null;
  }

  return (
    <>
      {features.map((feature) => (
        <ProductCollapse
          key={feature.id}
          title={feature.title}
          panelKey={feature.id}
        >
          <Flex vertical gap={16}>
            <Flex vertical>
              {feature.values.map((item) => (
                <Flex
                  key={item.id}
                  className={styles.characteristicRow}
                  justify="space-between"
                >
                  <Text strong>{feature.title}</Text>
                  <Text>{item.title}</Text>
                </Flex>
              ))}
            </Flex>

            <ShowMoreBtn />
          </Flex>
        </ProductCollapse>
      ))}
    </>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  characteristicRow: css`
    display: grid;

    grid-template-columns: 1fr 1fr;
    justify-content: start;

    padding: ${token.paddingSM}px ${token.padding}px;

    &:nth-of-type(odd) {
      background-color: ${token.colorBgLayout};
    }
  `,
}));
