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
  iconColor?: string;
  className?: string;
};

export const AppDrawerButton: React.FC<AppDrawerButtonProps> = ({
  size = 24,
  iconColor = 'currentColor',
  className,
}) => {
  const setIsAppDrawerOpen = useModalStore((s) => s.setIsAppDrawerOpen);
  const { styles } = useStyles();

  return (
    <Button
      className={clsx(styles.button, className)}
      type="text"
      icon={<Menu size={size} color={iconColor} />}
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
      background: var(--header-control-background, transparent);

      &:not(:disabled):not(.ant-btn-disabled):hover {
        background: var(
          --header-control-hover-background,
          ${token.colorBgTextHover}
        );
      }
    `,
  };
});
