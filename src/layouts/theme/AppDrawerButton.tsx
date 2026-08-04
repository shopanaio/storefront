'use client';

import React from 'react';
import { Button } from 'antd';
import { Menu } from 'lucide-react';
import { useModalStore } from '@src/store/appStore';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import { mq } from '@src/ui-kit/Theme/breakpoints';

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
      icon={<Menu size={size} />}
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
      color: var(--header-icon-color, ${token.colorText});
      background: var(--header-control-background, transparent);

      &:not(:disabled):not(.ant-btn-disabled):hover {
        color: var(--header-icon-color, ${token.colorText});
        background: var(
          --header-control-hover-background,
          ${token.colorBgTextHover}
        );
      }
    `,
  };
});
