import { toast } from "@src/components/UI/Toast/Toast";
import useRemoveItemFromCart from "@src/hooks/cart/useRemoveItemFromCart";
import { useTranslations } from "next-intl";

export const useRemoveItemFromBoxBuilderCart = () => {
  const { removeFromCart, loading } = useRemoveItemFromCart();
  const t = useTranslations("toast");

  return {
    removeFromCart: (input: Parameters<typeof removeFromCart>[0]) => {
      removeFromCart(input, {
        onSuccess: () => {},
        onError: () => {
          toast.error(t("add-failed"));
        },
      });
    },
    loading,
  };
};
