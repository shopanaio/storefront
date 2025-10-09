"use client";

import { Button, Flex, Modal, Typography } from "antd";
import { createStyles } from "antd-style";
import { FullBox } from "@src/modules/box-builder/Images/FullBox";
import { useTranslations } from "next-intl";
import { Activity, useFlow } from "@src/modules/box-builder/Stack";
import { useEffect, useState } from "react";
import { useBoxBuilderCart } from "@src/modules/box-builder/hooks/useCart";
import { useClearBoxBuilderCart } from "@src/modules/box-builder/hooks/useClearCart";
import { useBoxBuilderStore } from "@src/store/appStore";

const { Text } = Typography;

let modalDismissed = false;

export const PersistedModal = () => {
  const { styles } = useStyles();
  const { cart, loaded } = useBoxBuilderCart();
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();
  const { clearCart, loading } = useClearBoxBuilderCart();
  const { cartId } = useBoxBuilderStore();

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    modalDismissed = true;
  };

  useEffect(() => {
    if (!cartId) {
      modalDismissed = true;
      return;
    }

    // Modal should be shown ONLY if cart is loaded and not empty
    if (!loaded || modalDismissed) {
      return;
    }

    if (!cart?.totalQuantity) {
      modalDismissed = true;
      return;
    }
    // If no cart or it's empty — consider modal dismissed
    setIsOpen(true);
  }, [cart, cartId]);

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
          <FullBox />
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
            loading={loading}
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
