import { Button, Collapse, Flex, Radio, Typography } from "antd";
import { ReactNode, useRef } from "react";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import clsx from "clsx";
import Wave from "antd/es/_util/wave";

const { Panel } = Collapse;
const { Text } = Typography;

export interface CheckoutMethodPanelProps {
  title: string;
  isActive: boolean;
  onActivate: () => void;
  brand?: ReactNode;
  children: ReactNode;
}

export const CheckoutMethodPanel = ({
  title,
  isActive,
  onActivate,
  brand = null,
  children,
}: CheckoutMethodPanelProps) => {
  const codeRef = useRef(crypto.randomUUID());
  const { styles } = useStyles();
  return (
    <Collapse
      className={clsx(styles.collapse, isActive && styles.selected)}
      activeKey={isActive ? codeRef.current : ""}
      onChange={onActivate}
    >
      <Panel
        showArrow={false}
        key={codeRef.current}
        header={
          <Flex justify="space-between" align="center">
            <Flex gap={12}>
              <Radio checked={isActive} />
              <Text className={styles.methodTitle} strong>
                {title}
              </Text>
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
  container: css`
    width: 100%;
  `,
  selected: css`
    outline: 1px solid ${token.colorPrimary};
    border-color: ${token.colorPrimary};
  `,
  collapse: css`
    box-sizing: border-box;
    min-height: 56px;
    overflow: visible;
  `,
  methodTitle: css`
    ${mq.xxl} {
      font-size: ${token.fontSizeLG}px;
    }
  `,
}));
