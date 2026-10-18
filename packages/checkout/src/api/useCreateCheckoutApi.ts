import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
import { CombinedGraphQLErrors } from '@apollo/client';
import {
  graphQLErrorPlacement,
  isDefiniteRejection,
  mapPlacementPayload,
  PlacementUnconfirmedError,
} from '#checkout/state/placement/outcome';
export function useCreateCheckoutApi(): CheckoutApi {
  const t = useTranslations('Checkout');
  const { checkout = null } = useCheckoutData() || {};
  const { commit: commitSelectDelivery } = useCheckoutOperation(
    selectDeliveryMethodMutation,
    {
      errorMessage: t('error-select-delivery'),
      operationKey: OperationKey.SelectDeliveryMethod,
      sectionId: SectionId.Delivery,
    }
  );
  // Saves of the delivery customer input retry in the background; the delivery section
  // shows their failures itself instead of a toast on every retry.
  const { commit: commitUpdateDelivery } = useCheckoutOperation(
    selectDeliveryMethodMutation,
    {
      showErrorToast: false,
      operationKey: OperationKey.SelectDeliveryMethod,
      sectionId: SectionId.Delivery,
    }
  );
  const { commit: commitSelectPayment } = useCheckoutOperation(
    selectPaymentMethodMutation,
    {
      errorMessage: t('error-select-payment'),
      operationKey: OperationKey.SelectPaymentMethod,
      sectionId: SectionId.Payment,
    }
  );
  const { commit: commitUpdateIdentity } = useCheckoutOperation(
    updateCustomerIdentityMutation,
    {
      errorMessage: t('error-update-contact'),
      operationKey: OperationKey.UpdateCustomerIdentity,
      sectionId: SectionId.Contact,
    }
  );
  const { commit: commitAddAddresses } = useCheckoutOperation(
    addDeliveryAddressesMutation,
    {
      errorMessage: t('error-save-address'),
      operationKey: OperationKey.AddDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { commit: commitUpdateAddresses } = useCheckoutOperation(
    updateDeliveryAddressesMutation,
    {
      errorMessage: t('error-save-address'),
      operationKey: OperationKey.UpdateDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { commit: commitRemoveAddresses } = useCheckoutOperation(
    removeDeliveryAddressesMutation,
    {
      errorMessage: t('error-remove-address'),
      operationKey: OperationKey.RemoveDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { commit: commitAddPromo } = useCheckoutOperation(
    addPromoCodeMutation,
    {
      // The promo section shows the error next to the field.
      showErrorToast: false,
      operationKey: OperationKey.AddPromoCode,
      sectionId: SectionId.Promo,
    }
  );
  const { commit: commitRemovePromo } = useCheckoutOperation(
    removePromoCodeMutation,
    {
      showErrorToast: false,
      operationKey: OperationKey.RemovePromoCode,
      sectionId: SectionId.Promo,
    }
  );
  const { commit: commitUpdateNote } = useCheckoutOperation(
    updateCustomerNoteMutation,
    {
      errorMessage: t('error-update-note'),
      operationKey: OperationKey.UpdateCustomerNote,
      debounceMs: 250,
      sectionId: SectionId.Comment,
    }
  );
  const { commit: commitSubmitCheckout } = useCheckoutOperation(
    submitCheckoutMutation,
    {
      operationKey: OperationKey.SubmitCheckout,
      showErrorToast: false,
      rejectOnUserErrors: false,
    }
  );
  const { commit: commitAddRecipients } = useCheckoutOperation(
    addDeliveryRecipientsMutation,
    {
      errorMessage: t('error-save-recipient'),
      operationKey: OperationKey.AddDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );
  const { commit: commitUpdateRecipients } = useCheckoutOperation(
    updateDeliveryRecipientsMutation,
    {
      errorMessage: t('error-save-recipient'),
      operationKey: OperationKey.UpdateDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );
  const { commit: commitRemoveRecipients } = useCheckoutOperation(
    removeDeliveryRecipientsMutation,
    {
      errorMessage: t('error-remove-recipient'),
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
        const response = await commitAddPromo({ input: { ...input, ...mutationContext() } });
        return (response.checkoutPromoCodeAdd.checkout?.appliedPromoCodes ?? []).map(
          ({ code }) => code
        );
      },
      removePromoCode: async (input) => {
        await commitRemovePromo({ input: { ...input, ...mutationContext() } });
      },
      updateShippingMethod: async (input) => {
        await commitUpdateDelivery({
          input: { ...input, ...mutationContext() },
        });
      },
      submitCheckout: async (input) => {
        try {
          const response = await commitSubmitCheckout({ input });
          return mapPlacementPayload(response.placeOrder);
        } catch (error) {
          if (CombinedGraphQLErrors.is(error)) {
            // Only an error raised before placeOrder ran closes the attempt; any other error may
            // follow a placed order, so the attempt keeps its key for a safe retry.
            if (isDefiniteRejection(error.errors)) {
              return graphQLErrorPlacement(input.checkoutId, error.errors);
            }
            throw new PlacementUnconfirmedError();
          }
          throw error;
        }
      },
    };
  }, [
    checkout,
    commitSelectDelivery,
    commitUpdateDelivery,
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
