import { Flex, Modal } from "antd";
import { useModalStore } from "@src/store/appStore";
import { Auth } from "@src/templates/auth/blocks/Auth";
import { useLogo } from "@src/hooks/useLogo";
import { createStyles } from "antd-style";

export const AuthModal = () => {
  const Logo = useLogo();
  const isAuthModalVisible = useModalStore((state) => state.isAuthModalVisible);
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );

  const { styles } = useStyles();

  return (
    <Modal
      open={isAuthModalVisible}
      onCancel={() => setIsAuthModalVisible(false)}
      footer={null}
    >
      <Flex className={styles.modalContainer} vertical>
        <Flex className={styles.modalHeader}>
          <Logo size={32} noText />
        </Flex>
        <Auth />
      </Flex>
    </Modal>
  );
};

const useStyles = createStyles(({ css }) => {
  return {
    modalContainer: css`
      max-width: 365px;
      margin-left: auto;
      margin-right: auto;
    `,
    modalHeader: css`
      margin-left: -56px;
      margin-bottom: 56px;
    `,
  };
});
