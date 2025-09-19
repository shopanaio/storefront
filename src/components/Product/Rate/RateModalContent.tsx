import React, { useState } from "react";
import { CreateReview } from "./CreateReview";
import { ReviewSended } from "./ReviewSended";
import { ApiProduct } from "@codegen/schema-client";

type ModalType = "create" | "success";

interface Prop {
  product: ApiProduct;
  onClose: () => void;
}

export const RateModalContent = ({ product, onClose }: Prop) => {
  const [activeModal, setActiveModal] = useState<ModalType>("create");

  const renderContent = () => {
    switch (activeModal) {
      case "create":
        return (
          <CreateReview product={product} onSwitchContent={setActiveModal} />
        );
      case "success":
        return <ReviewSended onClose={onClose} />;

      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};
