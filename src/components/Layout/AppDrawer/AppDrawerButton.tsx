'use client';

import React, { ReactNode } from 'react';
import { Button, ButtonProps } from 'antd';
import { createStyles } from 'antd-style';

interface AppDrawerButtonProps extends Omit<ButtonProps, 'className'> {
  children: ReactNode;
  className?: string;
}

/**
 * Base button component for app drawer items
 */
export const AppDrawerButton: React.FC<AppDrawerButtonProps> = ({
  children,
  className,
  ...props
}) => {
  const { styles, cx } = useStyles();

  return (
    <Button
      variant="text"
      color="default"
      className={cx(styles.button, className)}
      {...props}
    >
      {children}
    </Button>
  );
};

const useStyles = createStyles(({ css }) => ({
  button: css`
    height: 46px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  `,
}));
