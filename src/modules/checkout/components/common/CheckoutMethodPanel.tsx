import { Collapse, Flex, Radio, Typography } from 'antd';
import { FC, ReactNode, useRef } from 'react';
import { createStyles } from 'antd-style';
import clsx from 'clsx';

const { Panel } = Collapse;
const { Text } = Typography;

export interface CheckoutMethodPanelProps {
  title: string;
  description: string | null;
  isActive: boolean;
  onActive: () => void;
  brand?: ReactNode;
  component: FC<any> | null;
  /** Props to pass to the component */
  componentProps?: Record<string, any>;
}

export const CheckoutMethodPanel = ({
  title,
  description,
  isActive,
  onActive,
  brand = null,
  component: Component,
  componentProps = {},
}: CheckoutMethodPanelProps) => {
  const codeRef = useRef(Math.random().toString(36).substring(2, 15));
  const { styles } = useStyles();
  return (
    <Collapse
      activeKey={isActive ? codeRef.current : ''}
      onChange={onActive}
      ghost
      bordered
      classNames={{
        body: clsx(styles.body, !Component && styles.hiddenBody),
        header: styles.header,
        root: clsx(styles.root, isActive && styles.active),
      }}
    >
      <Panel
        forceRender
        showArrow={false}
        key={codeRef.current}
        header={
          <Flex justify="space-between" align="center">
            <Flex gap={8}>
              <Radio checked={isActive} />
              <Flex vertical justify="center" className={styles.titleContainer}>
                <Text className={styles.title}>{title}</Text>
                {description && (
                  <Text type="secondary" className={styles.description}>
                    {description}
                  </Text>
                )}
              </Flex>
            </Flex>
            {brand}
          </Flex>
        }
      >
        {Component && <Component {...componentProps} />}
      </Panel>
    </Collapse>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  root: css`
    box-sizing: border-box;
    border: 1px solid;
    border-color: ${token.colorBorder};
    min-height: 50px;
    overflow: visible;
  `,
  active: css`
    outline: 1px solid ${token.colorPrimary};
    border-color: ${token.colorPrimary} !important;
  `,
  header: css``,
  body: css`
    padding: ${token.paddingXXS}px ${token.paddingSM}px ${token.paddingSM}px !important;
  `,
  hiddenBody: css`
    display: none !important;
  `,
  title: css`
    font-size: ${token.fontSize}px;
  `,
  description: css`
    font-size: ${token.fontSizeSM}px;
    display: inline-block;
    margin-top: -4px;
  `,
  titleContainer: css`
    height: 40px;
  `,
}));
