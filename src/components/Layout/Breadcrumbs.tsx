"use client";

import { useRoutes } from "@src/hooks/useRoutes";
import { Breadcrumb } from "antd";
import { createStyles } from "antd-style";
import { ItemType as BreadcrumbItem } from "antd/es/breadcrumb/Breadcrumb";
import { TbHomeFilled } from "react-icons/tb";

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  index?: boolean;
}

export const Breadcrumbs = ({ items = [], index }: BreadcrumbsProps) => {
  const { styles } = useStyles();
  const routes = useRoutes();

  if (items.length === 0 && !index) {
    return null;
  }

  return (
    <Breadcrumb
      style={{ width: "100%", opacity: 0.5 }}
      items={[
        {
          href: routes.home.path(),
          className: styles.breadcrumbItem,
          title: <TbHomeFilled size={18} />,
        },
        ...items,
      ]}
    />
  );
};

const useStyles = createStyles(({ css }) => ({
  breadcrumbItem: css`
    display: flex !important;
    align-items: center;
  `,
}));
