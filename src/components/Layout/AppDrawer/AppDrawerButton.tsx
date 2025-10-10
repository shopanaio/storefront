'use client';

import React, { ReactNode } from 'react';
import { Button, ButtonProps, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';

const { Text } = Typography;

interface AppDrawerButtonProps extends Omit<ButtonProps, 'className'> {
  children?: ReactNode;
  topText?: ReactNode;
  bottomText?: ReactNode;
  className?: string;
}

/**
 * Base button component for app drawer items with two-level label support
 */
export const AppDrawerButton: React.FC<AppDrawerButtonProps> = ({
  children,
  topText,
  bottomText,
  className,
  ...props
}) => {
  const { styles, cx } = useStyles();

  const content =
    topText || bottomText ? (
      <>
        <Flex className={styles.textWrapper} vertical>
          {topText && <Text className={styles.topText}>{topText}</Text>}
          {bottomText && (
            <Text className={styles.bottomText}>{bottomText}</Text>
          )}
        </Flex>
      </>
    ) : (
      children
    );

  return (
    <Button
      variant="text"
      color="default"
      className={cx(styles.button, className)}
      {...props}
    >
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        {content}
        {children}
      </Flex>
    </Button>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    height: 48px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  `,
  textWrapper: css`
    align-items: flex-start;
    flex: 1;
  `,
  topText: css`
    font-size: ${token.fontSizeSM}px;
    line-height: 1.2;
    color: ${token.colorTextTertiary};
  `,
  bottomText: css`
    font-weight: ${token.fontWeightStrong};
    font-size: ${token.fontSize}px;
    line-height: 1.2;
    color: ${token.colorText};
  `,
}));
