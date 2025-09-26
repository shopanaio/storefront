import { Collapse, Flex, Radio, Typography } from "antd";
import { ReactNode } from "react";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";

const { Panel } = Collapse;
const { Text } = Typography;

interface ShippingCollapsePanelProps {
  value: string;
  title: string;
  buttonLabel?: string | ReactNode;
  activeKey: string;
  setActiveKey: (key: string) => void;
  children: ReactNode;
}

export const MethodCollapsePanel = ({
  value,
  title,
  buttonLabel,
  activeKey,
  setActiveKey,
  children,
}: ShippingCollapsePanelProps) => {
  const { styles } = useStyles();
  return (
    <Collapse
      className={
        activeKey === value ? styles.collapseSelected : styles.collapse
      }
      activeKey={activeKey === value ? value : undefined}
      onChange={() => setActiveKey(value)}
      bordered
      ghost
    >
      <Panel
        showArrow={false}
        key={value}
        header={
          <Flex justify="space-between" align="center">
            <Flex gap={12}>
              <Radio checked={activeKey === value} />
              <Text className={styles.methodTitle} strong>
                {title}
              </Text>
            </Flex>
            {buttonLabel}
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
    border: 1px solid ${token.colorBorderSecondary};
  `,
  collapseSelected: css`
    border: 2px solid ${token.colorPrimary};
  `,
  methodTitle: css`
    ${mq.xxl} {
      font-size: ${token.fontSizeLG}px;
    }
  `,
}));
