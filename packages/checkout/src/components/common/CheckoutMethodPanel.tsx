import { Collapse, Flex, Radio, Typography } from 'antd';
import { ComponentType, ReactNode, useId } from 'react';
import { createStyles } from 'antd-style';
import { selectedDeclarations } from '#checkout/ui/selected';
import clsx from 'clsx';
import { OptionWave } from '#checkout/ui/OptionWave';

const { Panel } = Collapse;
const { Text } = Typography;

export interface CheckoutMethodPanelProps<P extends object = object> {
  title: string;
  description: string | null;
  isActive: boolean;
  onActive: () => void;
  brand?: ReactNode;
  /** The form of the method under its title; `null` for a method without customer input. */
  component: ComponentType<P> | null;
  /** Props to pass to the component */
  componentProps?: P;
}

export const CheckoutMethodPanel = <P extends object = object>({
  title,
  description,
  isActive,
  onActive,
  brand = null,
  component: Component,
  componentProps = {} as P,
}: CheckoutMethodPanelProps<P>) => {
  const code = useId();
  const { styles } = useStyles();
  return (
    <OptionWave disabled={isActive}>
      <Collapse
        activeKey={isActive ? code : ''}
        // A click on the active method changes nothing, so nothing is sent again (SC-83ef).
        onChange={() => {
          if (!isActive) {
            onActive();
          }
        }}
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
          key={code}
          header={
            <Flex justify="space-between" align="center" gap={12}>
              <Flex gap={8} className={styles.main}>
                <Radio checked={isActive} />
                <Flex
                  vertical
                  justify="center"
                  className={styles.titleContainer}
                >
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
    </OptionWave>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  root: css`
    box-sizing: border-box;
    border: 1px solid;
    border-color: ${token.colorBorder};
    /* White on any page, as the other cards of the checkout (SelectCard). */
    background: ${token.colorBgContainer} !important;
    min-height: 50px;
    overflow: visible;
  `,
  active: css`
    ${selectedDeclarations(token)}
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
  /* The texts wrap beside the brand mark, never under it. */
  main: css`
    flex: 1;
    min-width: 0;
  `,
  titleContainer: css`
    min-height: 40px;
  `,
}));
