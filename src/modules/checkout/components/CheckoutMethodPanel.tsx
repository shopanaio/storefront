import { Collapse, Flex, Radio, Typography } from 'antd';
import { ReactNode, useRef } from 'react';
import { createStyles } from 'antd-style';
import clsx from 'clsx';

const { Panel } = Collapse;
const { Text } = Typography;

export interface CheckoutMethodPanelProps {
  title: string;
  description: string;
  isActive: boolean;
  onActivate: () => void;
  brand?: ReactNode;
  children: ReactNode;
}

export const CheckoutMethodPanel = ({
  title,
  description,
  isActive,
  onActivate,
  brand = null,
  children,
}: CheckoutMethodPanelProps) => {
  const codeRef = useRef(crypto.randomUUID());
  const { styles } = useStyles();
  return (
    <Collapse
      className={clsx(styles.collapse, isActive && styles.active)}
      activeKey={isActive ? codeRef.current : ''}
      onChange={onActivate}
      ghost
      bordered
    >
      <Panel
        showArrow={false}
        key={codeRef.current}
        header={
          <Flex justify="space-between" align="center">
            <Flex gap={12}>
              <Radio checked={isActive} />
              <Flex vertical justify="center" className={styles.titleContainer}>
                <Text className={styles.title}>{title}</Text>
                {isActive && (
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
        {children}
      </Panel>
    </Collapse>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  collapse: css`
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
