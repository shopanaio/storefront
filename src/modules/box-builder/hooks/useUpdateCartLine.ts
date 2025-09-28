import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations } from "next-intl";
import useUpdateCartLineQuantity from "@src/hooks/cart/useUpdateCartLineQuantity";

export function useUpdateBoxBuilderCartLine() {
  const t = useTranslations("toast");

  const { updateQuantity, loading } = useUpdateCartLineQuantity();

  return {
    updateQuantity: (input: Parameters<typeof updateQuantity>[0]) => {
      updateQuantity(input, {
        onSuccess: () => {},
        onError: () => {
          toast.error(t("update-qty-failed"));
        },
      });
    },
    loading,
  };
}
