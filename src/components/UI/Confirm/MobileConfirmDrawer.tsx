'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { RootDrawer } from '@src/components/UI/Drawer/RootDrawer';
import { useMobileConfirmStore, mobileConfirmApi } from './mobileConfirmStore';

const { Text } = Typography;

/**
 * Mobile drawer for confirm flow. Layout:
 * icon (top) → title/content block → confirm button → cancel button.
 */
export const MobileConfirmDrawer = () => {
  const { styles } = useStyles();
  const open = useMobileConfirmStore((s) => s.open);
  const options = useMobileConfirmStore((s) => s.options);
  const resolve = useMobileConfirmStore((s) => s.resolve);

  if (!options) return null;

  const {
    icon,
    title,
    content,
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
  } = options;

  const handleClose = () => {
    mobileConfirmApi.close();
  };

  const handleOk = async () => {
    // Trigger resolve and close; portal will be cleared after exit animation
    resolve?.(true);
    mobileConfirmApi.close();
  };

  const handleCancel = () => {
    // Trigger close; clearing will happen on exit transition end
    resolve?.(false);
    mobileConfirmApi.close();
  };

  return (
    <RootDrawer
      open={open}
      onClose={handleCancel}
      onExited={() => {
        // After exit animation — remove from store (unmounts portal)
        mobileConfirmApi.clear();
      }}
      direction="bottom"
      minHeight="40vh"
    >
      <Flex vertical gap={16} className={styles.container}>
        {icon ? <div className={styles.icon}>{icon}</div> : null}
        <div className={styles.block}>
          {title ? (
            <Text strong className={styles.title}>
              {title}
            </Text>
          ) : null}
          {content ? <div className={styles.content}>{content}</div> : null}
        </div>
        <Flex vertical gap={12}>
          <Button
            type="primary"
            size="large"
            block
            {...okButtonProps}
            onClick={handleOk}
          >
            {okText}
          </Button>
          <Button
            size="large"
            block
            {...cancelButtonProps}
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
        </Flex>
      </Flex>
    </RootDrawer>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: ${token.padding}px;
  `,
  icon: css`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${token.paddingSM}px;
  `,
  block: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingXS}px;
    text-align: center;
  `,
  title: css`
    font-size: ${token.fontSizeXL}px;
  `,
  content: css``,
}));

export default MobileConfirmDrawer;
