"use client";

import { Button, Collapse, ConfigProvider, Typography } from "antd";
import { createStyles } from "antd-style";
import { useState } from "react";
import { TbChevronRight } from "react-icons/tb";

interface Props {
  title: React.ReactNode;
  panelKey: string;
  children: React.ReactNode;
  dense?: boolean;
}

export const ProductCollapse = ({
  title,
  panelKey,
  children,
  dense,
}: Props) => {
  const { styles } = useStyles({ dense });
  const [isOpen, setIsOpen] = useState(true);

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
        activeKey={isOpen ? [panelKey] : []}
        expandIconPosition="end"
        bordered={false}
        onChange={(keys) => setIsOpen(keys.length > 0)}
      >
        <Collapse.Panel
          forceRender
          showArrow={false}
          className={styles.collapsePanel}
          header={
            <Typography.Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              {title}
            </Typography.Title>
          }
          key={panelKey}
          extra={
            <div>
              <Button
                type="text"
                size="large"
                icon={
                  <TbChevronRight
                    size={20}
                    style={{
                      display: "flex",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                }
              />
            </div>
          }
        >
          <div className={styles.contentWrapper}>{children}</div>
        </Collapse.Panel>
      </Collapse>
    </ConfigProvider>
  );
};

const useStyles = createStyles(
  ({ css, token }, { dense }: { dense: boolean }) => ({
    collapsePanel: css`
      padding: ${token.padding}px 0;
      cursor: default;
    `,
    contentWrapper: css`
      margin-top: ${dense ? 0 : token.margin}px;
    `,
  })
);
