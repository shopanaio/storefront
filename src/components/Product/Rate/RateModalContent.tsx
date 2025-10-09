import React, { useState } from "react";
import { CreateReview } from "./CreateReview";
import { ReviewSended } from "./ReviewSended";
import type { Entity } from "@shopana/entity";

type ModalType = "create" | "success";

interface Prop {
  product: Entity.Product;
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
