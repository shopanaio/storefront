import { ApiCreateCartInput } from "@codegen/schema-client";
import { useMutation } from "react-relay";
import { useCreateCartMutation } from "@src/hooks/cart/useCreateCart/useCreateCart.shopana";
import { createCartMutation as CreateCartMutationType } from "@src/relay/queries/__generated__/createCartMutation.graphql";
import { useBoxBuilderStore } from "@src/store/appStore";
import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations } from "next-intl";

export const useCreateCart = () => {
  const t = useTranslations("toast");
  const setBoxCartId = useBoxBuilderStore((s) => s.setBoxCartId);
  const [commit, isInFlight] =
    useMutation<CreateCartMutationType>(useCreateCartMutation);

  const createCart = (
    input: ApiCreateCartInput,
  ): Promise<
    CreateCartMutationType["response"]["createCart"]["cart"]
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
          if (
            response?.createCart?.errors &&
            response.createCart.errors.length > 0
          ) {
            toast.error(t("create-cart-failed"));
            reject(response.createCart.errors);
            return;
          }

          const cart = response?.createCart?.cart;
          const createdId = (cart as any)?.id as string | undefined;
          if (createdId) {
            // In Box Builder save cart identifier in zustand,
            // without affecting global site cookies
            setBoxCartId(createdId);
          }
          resolve(cart);
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
