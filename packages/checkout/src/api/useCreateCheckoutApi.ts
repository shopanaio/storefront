import { useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useApolloClient } from '@apollo/client/react';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
import {
  followSuperseded,
  isMutationSuperseded,
} from '@shopana/storefront-sdk/modules/cart/core/utils/mutationQueue';
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
  INPUT_UNSAVED_CODE,
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
  /**
   * Resources whose latest save failed while the buyer's value stays on screen (address,
   * contact, note, recipient). The order is not placed until each is saved (BR-awbl).
   */
  const unsavedWrites = useRef<{
    checkoutId: string | null;
    keys: Set<string>;
  }>({
    checkoutId: null,
    keys: new Set(),
  });
  const { commit: commitSelectDelivery } = useCheckoutOperation(
    selectDeliveryMethodMutation,
    {
      // The delivery section shows a failed selection with its retry.
      reportError: false,
      operationKey: OperationKey.SelectDeliveryMethod,
      sectionId: SectionId.Delivery,
    }
  );
  // Saves of the delivery customer input retry in the background; the delivery section
  // shows their failures itself.
  const { commit: commitUpdateDelivery } = useCheckoutOperation(
    selectDeliveryMethodMutation,
    {
      reportError: false,
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
      // The address section shows the failure under the form.
      reportError: false,
      operationKey: OperationKey.AddDeliveryAddresses,
      sectionId: SectionId.Address,
    }
  );
  const { send: sendUpdateAddresses } = useCheckoutOperation(
    updateDeliveryAddressesMutation,
    {
      // The address section shows the failure under the form.
      reportError: false,
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
      reportError: false,
      operationKey: OperationKey.AddPromoCode,
      sectionId: SectionId.Promo,
    }
  );
  const { commit: commitRemovePromo } = useCheckoutOperation(
    removePromoCodeMutation,
    {
      reportError: false,
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
      reportError: false,
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
      const cached = data?.checkout
        ? mapApiCheckoutToCheckout(data.checkout)
        : null;
      const shown =
        latestCheckout.current?.id === checkoutId
          ? latestCheckout.current
          : null;
      // The cache may hold an older snapshot than the one shown (a late answer of a read sent
      // before the last write): the newer of the two describes the checkout (SC-4i3a).
      const current =
        cached && shown
          ? cached.updatedAt.getTime() >= shown.updatedAt.getTime()
            ? cached
            : shown
          : (cached ?? shown);
      if (!current) {
        throw new Error('Checkout is unavailable');
      }
      return current;
    };
    const unsavedKeys = () => {
      const checkoutId = checkout?.id ?? null;
      if (unsavedWrites.current.checkoutId !== checkoutId) {
        unsavedWrites.current = { checkoutId, keys: new Set() };
      }
      return unsavedWrites.current.keys;
    };
    /** Records whether the latest save of `key` got through. */
    const tracked = async <T>(key: string, write: Promise<T>): Promise<T> => {
      const keys = unsavedKeys();
      try {
        const value = await write;
        keys.delete(key);
        return value;
      } catch (error) {
        if (!isMutationSuperseded(error)) keys.add(key);
        throw error;
      }
    };
    return {
      // A save replaced in the queue by a newer one rejects with `MutationSupersededError`:
      // the delivery section must not take a value that never went for a saved one (BR-q2xm).
      selectDeliveryMethod: async (input) => {
        await commitSelectDelivery(
          { input: { ...input, ...mutationContext() } },
          { key: `delivery:${input.deliveryGroupId}`, superseded: 'reject' }
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
        await tracked(
          'contact',
          commitUpdateIdentity(
            { input: { ...input, ...mutationContext() } },
            { key: 'contact' }
          )
        );
      },
      saveDeliveryAddress: async (address) => {
        await tracked(
          'address',
          followSuperseded(
            enqueueMutation(
              async () => {
                const data = mapCheckoutToAddressFormData(currentCheckout());
                if (!data) return;
                const { update, add } = addressMutations(data, address);
                const context = mutationContext();
                if (update) {
                  await sendUpdateAddresses({
                    input: { ...update, ...context },
                  });
                }
                if (add) {
                  await sendAddAddresses({ input: { ...add, ...context } });
                }
              },
              { key: 'address' }
            )
          )
        );
      },
      removeDeliveryAddresses: async (input) => {
        await commitRemoveAddresses({
          input: { ...input, ...mutationContext() },
        });
      },
      saveDeliveryRecipient: async (recipient) => {
        await tracked(
          'recipient',
          followSuperseded(
            enqueueMutation(
              async () => {
                const data = mapCheckoutToRecipientFormData(currentCheckout());
                if (!data) return;
                const { remove, update, add } = recipientMutations(
                  data,
                  recipient
                );
                const context = mutationContext();
                if (remove) {
                  await sendRemoveRecipients({
                    input: { ...remove, ...context },
                  });
                }
                if (update) {
                  await sendUpdateRecipients({
                    input: { ...update, ...context },
                  });
                }
                if (add) {
                  await sendAddRecipients({ input: { ...add, ...context } });
                }
              },
              { key: 'recipient' }
            )
          )
        );
      },
      updateCustomerNote: async (input) => {
        await tracked(
          'note',
          commitUpdateNote(
            { input: { ...input, ...mutationContext() } },
            { key: 'note' }
          )
        );
      },
      addPromoCode: async (input) => {
        await commitAddPromo({ input: { ...input, ...mutationContext() } });
      },
      removePromoCode: async (input) => {
        await commitRemovePromo({ input: { ...input, ...mutationContext() } });
      },
      // The saved input of the selected option is its own resource: a waiting save of it never
      // replaces an explicit selection, which goes after it in the queue (BR-q2xm).
      updateShippingMethod: async (input) => {
        await commitUpdateDelivery(
          { input: { ...input, ...mutationContext() } },
          {
            key: `delivery-input:${input.deliveryGroupId}`,
            superseded: 'reject',
          }
        );
      },
      submitCheckout: async (input) => {
        // The order goes with everything the buyer entered: input held back (a note waiting
        // for a pause in typing or for its retry) is sent now, and placeOrder waits for every
        // write queued before it.
        await Promise.allSettled(flushPendingInputs());
        await waitForMutations();
        if (unsavedKeys().size > 0) {
          // A value the buyer sees was not saved: the order would go without it.
          return graphQLErrorPlacement(input.checkoutId, [
            { message: '', extensions: { code: INPUT_UNSAVED_CODE } },
          ]);
        }
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
