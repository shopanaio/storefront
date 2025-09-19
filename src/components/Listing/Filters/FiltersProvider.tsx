import React from "react";
import { Collapse, ConfigProvider } from "antd";
import { createStyles } from "antd-style";

const { Panel } = Collapse;

interface Props {
  handle: string;
  children: React.ReactNode;
}

export const FiltersProvider: React.FC<Props> = ({ handle, children }) => {
  const { styles } = useStyles();

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerPadding: 0,
            contentPadding: 0,
            headerBg: "transparent",
            contentBg: "transparent",
          },
        },
      }}
    >
      <Collapse
        defaultActiveKey={[handle]}
        expandIconPosition="end"
        bordered={false}
      >
        <Panel className={styles.collapsePanel} header={handle} key={handle}>
          {children}
        </Panel>
      </Collapse>
    </ConfigProvider>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  collapsePanel: css`
    display: flex;
    flex-direction: column;
    gap: ${token.margin}px;
    padding: ${token.padding}px 0;
  `,
}));