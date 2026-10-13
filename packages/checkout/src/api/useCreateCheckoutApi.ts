import { useMemo } from 'react';
import { CheckoutApi } from '#checkout/api/interface';
import { useCheckoutOperation } from '#checkout/api/useCheckoutOperation';
import { OperationKey } from '#checkout/state/checkoutBus';
import { SectionId } from '#checkout/state/interface';
import { selectDeliveryMethodMutation } from '#checkout/api/mutations/selectDeliveryMethodMutation.shopana';
import { selectPaymentMethodMutation } from '#checkout/api/mutations/selectPaymentMethodMutation.shopana';
import { updateCustomerIdentityMutation } from '#checkout/api/mutations/updateCustomerIdentityMutation.shopana';
import { addDeliveryAddressesMutation } from '#checkout/api/mutations/addDeliveryAddressesMutation.shopana';
import { updateDeliveryAddressesMutation } from '#checkout/api/mutations/updateDeliveryAddressesMutation.shopana';
import { removeDeliveryAddressesMutation } from '#checkout/api/mutations/removeDeliveryAddressesMutation.shopana';
import { addDeliveryRecipientsMutation } from '#checkout/api/mutations/addDeliveryRecipientsMutation.shopana';
import { updateDeliveryRecipientsMutation } from '#checkout/api/mutations/updateDeliveryRecipientsMutation.shopana';
import { removeDeliveryRecipientsMutation } from '#checkout/api/mutations/removeDeliveryRecipientsMutation.shopana';
import { addPromoCodeMutation } from '#checkout/api/mutations/addPromoCodeMutation.shopana';
import { removePromoCodeMutation } from '#checkout/api/mutations/removePromoCodeMutation.shopana';
import { updateCustomerNoteMutation } from '#checkout/api/mutations/updateCustomerNoteMutation.shopana';
import { submitCheckoutMutation } from '#checkout/api/mutations/submitCheckoutMutation.shopana';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { createCheckoutIdempotencyKey } from '@shopana/storefront-sdk/modules/cart/core/utils/idempotencyKey';
export function useCreateCheckoutApi(): CheckoutApi {
  const { checkout = null } = useCheckoutData() || {};
  const { commit: commitSelectDelivery } = useCheckoutOperation(
    selectDeliveryMethodMutation,
    {
      errorMessage: 'Failed to select delivery method',
      operationKey: OperationKey.SelectDeliveryMethod,
      sectionId: SectionId.Delivery,
    }
  );
  const { commit: commitSelectPayment } = useCheckoutOperation(
    selectPaymentMethodMutation,
    {
      errorMessage: 'Failed to select payment method',
      operationKey: OperationKey.SelectPaymentMethod,
      sectionId: SectionId.Payment,
    }
  );
  const { commit: commitUpdateIdentity } = useCheckoutOperation(
    updateCustomerIdentityMutation,
    {
      errorMessage: 'Failed to update customer identity',
      operationKey: OperationKey.UpdateCustomerIdentity,
      sectionId: SectionId.Contact,
    }
  );
  const { commit: commitAddAddresses } = useCheckoutOperation(
    addDeliveryAddressesMutation,
    {
      errorMessage: 'Failed to add delivery addresses',
      operationKey: OperationKey.AddDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { commit: commitUpdateAddresses } = useCheckoutOperation(
    updateDeliveryAddressesMutation,
    {
      errorMessage: 'Failed to update delivery addresses',
      operationKey: OperationKey.UpdateDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { commit: commitRemoveAddresses } = useCheckoutOperation(
    removeDeliveryAddressesMutation,
    {
      errorMessage: 'Failed to remove delivery addresses',
      operationKey: OperationKey.RemoveDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { commit: commitAddPromo } = useCheckoutOperation(
    addPromoCodeMutation,
    {
      errorMessage: 'Failed to add promo code',
      operationKey: OperationKey.AddPromoCode,
      sectionId: SectionId.Promo,
    }
  );
  const { commit: commitRemovePromo } = useCheckoutOperation(
    removePromoCodeMutation,
    {
      errorMessage: 'Failed to remove promo code',
      operationKey: OperationKey.RemovePromoCode,
      sectionId: SectionId.Promo,
    }
  );
  const { commit: commitUpdateNote } = useCheckoutOperation(
    updateCustomerNoteMutation,
    {
      errorMessage: 'Failed to update customer note',
      operationKey: OperationKey.UpdateCustomerNote,
      debounceMs: 250,
      sectionId: SectionId.Comment,
    }
  );
  const { commit: commitSubmitCheckout } = useCheckoutOperation(
    submitCheckoutMutation,
    {
      errorMessage: 'Failed to submit checkout',
      operationKey: OperationKey.SubmitCheckout,
    }
  );
  const { commit: commitAddRecipients } = useCheckoutOperation(
    addDeliveryRecipientsMutation,
    {
      errorMessage: 'Failed to add delivery recipients',
      operationKey: OperationKey.AddDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );
  const { commit: commitUpdateRecipients } = useCheckoutOperation(
    updateDeliveryRecipientsMutation,
    {
      errorMessage: 'Failed to update delivery recipients',
      operationKey: OperationKey.UpdateDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );
  const { commit: commitRemoveRecipients } = useCheckoutOperation(
    removeDeliveryRecipientsMutation,
    {
      errorMessage: 'Failed to remove delivery recipients',
      operationKey: OperationKey.RemoveDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );
  return useMemo(() => {
    const mutationContext = () => {
      if (!checkout) {
        throw new Error('Checkout is unavailable');
      }
      return {
        checkoutId: checkout.id,
      };
    };
    return {
      selectDeliveryMethod: async (input) => {
        await commitSelectDelivery({
          input: { ...input, ...mutationContext() },
        });
      },
      selectPaymentMethod: async (input) => {
        await commitSelectPayment({
          input: { ...input, ...mutationContext() },
        });
      },
      updatePaymentMethod: async (input) => {
        await commitSelectPayment({
          input: { ...input, ...mutationContext() },
        });
      },
      updateCustomerIdentity: async (input) => {
        await commitUpdateIdentity({
          input: { ...input, ...mutationContext() },
        });
      },
      addDeliveryAddresses: async (input) => {
        await commitAddAddresses({ input: { ...input, ...mutationContext() } });
      },
      updateDeliveryAddresses: async (input) => {
        await commitUpdateAddresses({
          input: { ...input, ...mutationContext() },
        });
      },
      removeDeliveryAddresses: async (input) => {
        await commitRemoveAddresses({
          input: { ...input, ...mutationContext() },
        });
      },
      addDeliveryRecipients: async (input) => {
        await commitAddRecipients({
          input: { ...input, ...mutationContext() },
        });
      },
      updateDeliveryRecipients: async (input) => {
        await commitUpdateRecipients({
          input: { ...input, ...mutationContext() },
        });
      },
      removeDeliveryRecipients: async (input) => {
        await commitRemoveRecipients({
          input: { ...input, ...mutationContext() },
        });
      },
      updateCustomerNote: async (input) => {
        await commitUpdateNote({ input: { ...input, ...mutationContext() } });
      },
      addPromoCode: async (input) => {
        await commitAddPromo({ input: { ...input, ...mutationContext() } });
      },
      removePromoCode: async (input) => {
        await commitRemovePromo({ input: { ...input, ...mutationContext() } });
      },
      updateShippingMethod: async (input) => {
        await commitSelectDelivery({
          input: { ...input, ...mutationContext() },
        });
      },
      submitCheckout: async (input) => {
        await commitSubmitCheckout({
          input: {
            ...input,
            ...mutationContext(),
            idempotencyKey: createCheckoutIdempotencyKey(),
          },
        });
      },
    };
  }, [
    checkout,
    commitSelectDelivery,
    commitSelectPayment,
    commitUpdateIdentity,
    commitAddAddresses,
    commitUpdateAddresses,
    commitRemoveAddresses,
    commitAddRecipients,
    commitUpdateRecipients,
    commitRemoveRecipients,
    commitUpdateNote,
    commitAddPromo,
    commitRemovePromo,
    commitSubmitCheckout,
  ]);
}
