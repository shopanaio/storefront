import { toast } from "@src/components/UI/Toast/Toast";
import useAddItemToCart from "@src/hooks/cart/useAddItemToCart";
import { useTranslations } from "next-intl";

export const useAddItemToBoxBuilderCart = () => {
  const { addToCart, isInFlight } = useAddItemToCart();
  const t = useTranslations("toast");

  return {
    addToCart: (input: Parameters<typeof addToCart>[0]) => {
      addToCart(input, {
        onSuccess: () => {},
        onError: () => {
          toast.error(t("add-failed"));
        },
      });
    },
    loading: isInFlight,
  };
};
