import { toast } from "@src/components/UI/Toast/Toast";
import useClearCart from "@src/hooks/cart/useClearCart";
import { useTranslations } from "next-intl";

export const useClearBoxBuilderCart = () => {
  const { clearCart, loading } = useClearCart();
  const t = useTranslations("toast");

  return {
    clearCart: () => {
      clearCart({}, {
        onSuccess: () => {},
        onError: () => {
          toast.error(t("clear-failed"));
        },
      });
    },
    loading,
  };
};
