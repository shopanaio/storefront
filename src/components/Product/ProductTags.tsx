"use client";

import { Flex, Button } from "antd";
import { createStyles } from "antd-style";
import type { model } from "@shopana/storefront-sdk/model/namespace";

interface Props {
  tags: model.Edge<model.Tag>[];
}

export const ProductTags = ({ tags }: Props) => {
  const { styles } = useStyles();

  return (
    <Flex wrap gap={8}>
      {tags?.map((tag) => (
        <Button
          key={tag.node.id}
          id={tag.node.id}
          className={styles.categoryLinkBtn}
          variant="link"
          color="primary"
        >
          {tag.node.title}
        </Button>
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  categoryLinkBtn: css`
    padding: 0;
  `,
}));
