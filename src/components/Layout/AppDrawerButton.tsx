"use client";

import React from "react";
import { Button } from "antd";
import { TbMenu2 } from "react-icons/tb";
import { useModalStore } from "@src/store/appStore";
import { createStyles } from "antd-style";
import clsx from "clsx";
import { mq } from "@src/components/Theme/breakpoints";

type AppDrawerButtonProps = {
  size?: number;
  className?: string;
};

export const AppDrawerButton: React.FC<AppDrawerButtonProps> = ({
  size = 24,
  className,
}) => {
  const setIsAppDrawerOpen = useModalStore((s) => s.setIsAppDrawerOpen);
  const { styles } = useStyles();

  return (
    <Button
      className={clsx(styles.button, className)}
      type="text"
      icon={<TbMenu2 size={size} />}
      onClick={() => setIsAppDrawerOpen(true)}
    />
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    button: css`
      order: -1;
      height: var(--components-header-control-height);
      aspect-ratio: 1/1;
      flex-shrink: 0;
      width: var(--components-header-control-height) !important;

      ${mq.lg} {
        display: none;
      }
    `,
  };
});
