import React from "react";
import { Collapse, ConfigProvider } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";

const { Panel } = Collapse;

interface Props {
  handle: string;
  children: React.ReactNode;
}

export const FiltersProvider: React.FC<Props> = ({ handle, children }) => {
  const { styles } = useStyles();
  const t = useTranslations("Listing.filter-groups");

  /**
   * Gets the translated title for the filter handle
   * Falls back to the handle itself if no translation is found
   */
  const getFilterTitle = (handle: string): string => {
    try {
      return t(handle as any);
    } catch {
      // Fallback to handle if translation key doesn't exist
      return handle;
    }
  };

  const filterTitle = getFilterTitle(handle);

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
        expandIconPlacement="end"
        bordered={false}
      >
        <Panel className={styles.collapsePanel} header={filterTitle} key={handle}>
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
