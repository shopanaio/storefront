import { ApiCheckoutCreateInput } from "@codegen/schema-client";
import { useMutation } from "react-relay";
import { useCreateCartMutation } from "@src/hooks/cart/useCreateCart/useCreateCart.shopana";
import { useCreateCartMutation as CreateCartMutationType } from "@src/hooks/cart/useCreateCart/__generated__/useCreateCartMutation.graphql";
import { useBoxBuilderStore } from "@src/store/appStore";
import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations } from "next-intl";

export const useCreateCart = () => {
  const t = useTranslations("toast");
  const setBoxCartId = useBoxBuilderStore((s) => s.setBoxCartId);
  const [commit, isInFlight] =
    useMutation<CreateCartMutationType>(useCreateCartMutation);

  const createCart = (
    input: ApiCheckoutCreateInput,
  ): Promise<
    CreateCartMutationType["response"]["checkoutMutation"]["checkoutCreate"]
  > => {
    return new Promise((resolve, reject) => {
      commit({
        variables: { input },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            toast.error(t("create-cart-failed"));
            reject(errors);
            return;
          }

          const checkout = response?.checkoutMutation?.checkoutCreate;
          if (!checkout) {
            toast.error(t("create-cart-failed"));
            reject(new Error("Failed to create checkout"));
            return;
          }

          const createdId = (checkout as any).id;
          if (createdId) {
            setBoxCartId(createdId);
          }
          resolve(checkout);
        },
        onError: (err) => {
          toast.error(t("create-cart-failed"));
          reject(err);
        },
      });
    });
  };

  return { createCart, isLoading: isInFlight };
};
