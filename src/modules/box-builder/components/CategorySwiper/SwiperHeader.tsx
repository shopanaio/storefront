"use client";

import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { TbChevronRight } from "react-icons/tb";
import { Activity, useFlow } from "@src/modules/box-builder/Stack";

const { Text } = Typography;

interface Props {
  title: string;
  handle: string;
}

export default function BoxBuilderSwiperHeader({ title, handle }: Props) {
  const { styles } = useStyles();
  const { push } = useFlow();

  return (
    <Flex align="center" justify="space-between" className={styles.container}>
      <Text className={styles.title} strong>
        {title}
      </Text>
      <Button
        icon={<TbChevronRight size={18} />}
        shape="circle"
        onClick={() => {
          push(Activity.Category, {
            categoryHandle: handle,
          });
        }}
      />
    </Flex>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      padding: 0 ${token.padding}px;
    `,
    title: css`
      font-size: ${token.fontSizeXL}px;
    `,
  };
});
