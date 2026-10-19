import { useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useApolloClient } from '@apollo/client/react';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
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
import { StorefrontLoadCheckoutQueryDocument } from '#checkout/graphql/operations';
import { mapApiCheckoutToCheckout } from '#checkout/hooks/useCheckout/mapApiCheckoutToCheckout';
import {
  addressMutations,
  mapCheckoutToAddressFormData,
} from '#checkout/sections/address/mapper';
import {
  mapCheckoutToRecipientFormData,
  recipientMutations,
} from '#checkout/sections/recipient/mapper';
import { flushPendingInputs } from '#checkout/state/pendingInputs';
import type { Checkout } from '#checkout/types/entity';
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
  const client = useApolloClient();
  const { enqueueMutation, waitForMutations } = useCartSetters();
  /** Checkout of the latest render, for tasks that start later in the queue. */
  const latestCheckout = useRef(checkout);
  useEffect(() => {
    latestCheckout.current = checkout;
  });
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
  const { send: sendAddAddresses } = useCheckoutOperation(
    addDeliveryAddressesMutation,
    {
      errorMessage: t('error-save-address'),
      operationKey: OperationKey.AddDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { send: sendUpdateAddresses } = useCheckoutOperation(
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
  const { send: sendAddRecipients } = useCheckoutOperation(
    addDeliveryRecipientsMutation,
    {
      errorMessage: t('error-save-recipient'),
      operationKey: OperationKey.AddDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );
  const { send: sendUpdateRecipients } = useCheckoutOperation(
    updateDeliveryRecipientsMutation,
    {
      errorMessage: t('error-save-recipient'),
      operationKey: OperationKey.UpdateDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );
  const { send: sendRemoveRecipients } = useCheckoutOperation(
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
    /**
     * The checkout as the last answer left it. A task that waited in the queue reads it when it
     * starts: the answer of the write before it is in the Apollo cache already, while the
     * rendered checkout may not have caught up yet.
     */
    const currentCheckout = (): Checkout.Checkout => {
      const { checkoutId } = mutationContext();
      const data = client.readQuery({
        query: StorefrontLoadCheckoutQueryDocument,
        variables: { checkoutId },
      });
      const current = data?.checkout
        ? mapApiCheckoutToCheckout(data.checkout)
        : latestCheckout.current;
      if (!current) {
        throw new Error('Checkout is unavailable');
      }
      return current;
    };
    return {
      selectDeliveryMethod: async (input) => {
        await commitSelectDelivery(
          { input: { ...input, ...mutationContext() } },
          { key: `delivery:${input.deliveryGroupId}` }
        );
      },
      selectPaymentMethod: async (input) => {
        await commitSelectPayment(
          { input: { ...input, ...mutationContext() } },
          { key: 'payment' }
        );
      },
      updatePaymentMethod: async (input) => {
        await commitSelectPayment(
          { input: { ...input, ...mutationContext() } },
          { key: 'payment' }
        );
      },
      updateCustomerIdentity: async (input) => {
        await commitUpdateIdentity(
          { input: { ...input, ...mutationContext() } },
          { key: 'contact' }
        );
      },
      saveDeliveryAddress: async (address) => {
        await enqueueMutation(
          async () => {
            const data = mapCheckoutToAddressFormData(currentCheckout());
            if (!data) return;
            const { update, add } = addressMutations(data, address);
            const context = mutationContext();
            if (update) {
              await sendUpdateAddresses({ input: { ...update, ...context } });
            }
            if (add) {
              await sendAddAddresses({ input: { ...add, ...context } });
            }
          },
          { key: 'address' }
        );
      },
      removeDeliveryAddresses: async (input) => {
        await commitRemoveAddresses({
          input: { ...input, ...mutationContext() },
        });
      },
      saveDeliveryRecipient: async (recipient) => {
        await enqueueMutation(
          async () => {
            const data = mapCheckoutToRecipientFormData(currentCheckout());
            if (!data) return;
            const { remove, update, add } = recipientMutations(data, recipient);
            const context = mutationContext();
            if (remove) {
              await sendRemoveRecipients({ input: { ...remove, ...context } });
            }
            if (update) {
              await sendUpdateRecipients({ input: { ...update, ...context } });
            }
            if (add) {
              await sendAddRecipients({ input: { ...add, ...context } });
            }
          },
          { key: 'recipient' }
        );
      },
      updateCustomerNote: async (input) => {
        await commitUpdateNote(
          { input: { ...input, ...mutationContext() } },
          { key: 'note' }
        );
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
        await commitUpdateDelivery(
          { input: { ...input, ...mutationContext() } },
          { key: `delivery:${input.deliveryGroupId}` }
        );
      },
      submitCheckout: async (input) => {
        // The order goes with everything the buyer entered: a note waiting for a pause in
        // typing is sent now, and placeOrder waits for every write queued before it.
        flushPendingInputs();
        await waitForMutations();
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
    client,
    enqueueMutation,
    waitForMutations,
    commitSelectDelivery,
    commitUpdateDelivery,
    commitSelectPayment,
    commitUpdateIdentity,
    sendAddAddresses,
    sendUpdateAddresses,
    commitRemoveAddresses,
    sendAddRecipients,
    sendUpdateRecipients,
    sendRemoveRecipients,
    commitUpdateNote,
    commitAddPromo,
    commitRemovePromo,
    commitSubmitCheckout,
  ]);
}
