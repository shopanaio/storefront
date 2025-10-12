"use client";

import { Flex, Button } from "antd";
import { createStyles } from "antd-style";
import type { Entity } from "@shopana/entity";

interface Props {
  tags: Entity.Edge<Entity.Tag>[];
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
