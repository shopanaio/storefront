"use client";

import { Button, Flex, Modal, Typography } from "antd";
import { createStyles } from "antd-style";
import { FullBoxImg } from "./Images/FullBoxImg";
import { useTranslations } from "next-intl";
import { Activity, useFlow } from "./stackflow/Stack";
import { useEffect, useState } from "react";
import { useCart } from "@src/modules/box-builder/hooks/useCart";
import { useClearCart } from "./hooks/useClearCart";

const { Text } = Typography;

let modalDismissed = false;

export const PersistedModal = () => {
  const { styles } = useStyles();
  const { cart, loaded } = useCart();
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();
  const { clearCart, isLoading } = useClearCart();

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    modalDismissed = true;
  };

  useEffect(() => {
    // Modal should be shown ONLY if cart is loaded and not empty
    if (!loaded || modalDismissed) return;

    if (cart && cart.totalQuantity) {
      setIsOpen(true);
      return;
    }
    // If no cart or it's empty — consider modal dismissed
    modalDismissed = true;
  }, [cart, loaded]);

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      closable={true}
      centered
      styles={{
        body: {
          paddingTop: 20,
        },
      }}
    >
      <Flex vertical gap={20}>
        <Flex vertical align="center" gap={36}>
          <FullBoxImg />
          <Text strong className={styles.title}>
            {t("modal.title")}
          </Text>
        </Flex>

        <Flex vertical gap={12}>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              handleClose();
              push(Activity.Cart, {});
            }}
          >
            {t("modal.view-box")}
          </Button>
          <Button
            variant="outlined"
            size="large"
            loading={isLoading}
            onClick={async () => {
              try {
                await clearCart();
              } finally {
                handleClose();
              }
            }}
          >
            {t("modal.create-new")}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    title: css`
      font-size: ${token.fontSizeXL}px;
    `,
  };
});
