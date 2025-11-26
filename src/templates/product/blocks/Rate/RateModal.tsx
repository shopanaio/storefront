import { Modal } from "antd";
/* import { useTranslations } from "next-intl"; */
import { useEffect } from "react";
import { RateModalContent } from "./RateModalContent";
import { useModalStore, useReviewStore } from "@src/store/appStore";

import { useSession } from "@src/hooks/useSession";

export const RateModal = () => {
  const setIsRateModalVisible = useModalStore(
    (state) => state.setIsRateModalVisible
  );
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const reviewProduct = useReviewStore((state) => state.reviewProduct);
  const clearReviewProduct = useReviewStore(
    (state) => state.clearReviewProduct
  );
  const session = useSession((state) => state.session);
  const user = session?.user;

  // If user is not authorized — open authorization modal
  useEffect(() => {
    if (reviewProduct && !user) {
      setIsAuthModalVisible(true);
      setIsRateModalVisible(true);
    }
  }, [reviewProduct, user, setIsRateModalVisible]);

  // If no product — don't render modal
  if (!reviewProduct) return null;

  // Close modal
  const handleClose = () => {
    clearReviewProduct();
  };

  return (
    <Modal
      open={!!reviewProduct && !!user}
      onCancel={handleClose}
      footer={null}
    >
      <RateModalContent product={reviewProduct} onClose={handleClose} />
    </Modal>
  );
};
