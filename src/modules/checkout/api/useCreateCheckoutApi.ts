import { useMemo } from 'react';
import { CheckoutApi } from '@src/modules/checkout/api/interface';
import { useCheckoutOperation } from '@src/modules/checkout/api/useCheckoutOperation';
import { OperationKey } from '@src/modules/checkout/state/checkoutBus';
import { SectionId } from '@src/modules/checkout/state/interface';

import { selectDeliveryMethodMutation } from '@src/modules/checkout/api/mutations/selectDeliveryMethodMutation.shopana';
import { selectPaymentMethodMutation } from '@src/modules/checkout/api/mutations/selectPaymentMethodMutation.shopana';
import { updateCustomerIdentityMutation } from '@src/modules/checkout/api/mutations/updateCustomerIdentityMutation.shopana';
import { addDeliveryAddressesMutation } from '@src/modules/checkout/api/mutations/addDeliveryAddressesMutation.shopana';
import { updateDeliveryAddressesMutation } from '@src/modules/checkout/api/mutations/updateDeliveryAddressesMutation.shopana';
import { removeDeliveryAddressesMutation } from '@src/modules/checkout/api/mutations/removeDeliveryAddressesMutation.shopana';
import { addDeliveryRecipientsMutation } from '@src/modules/checkout/api/mutations/addDeliveryRecipientsMutation.shopana';
import { updateDeliveryRecipientsMutation } from '@src/modules/checkout/api/mutations/updateDeliveryRecipientsMutation.shopana';
import { removeDeliveryRecipientsMutation } from '@src/modules/checkout/api/mutations/removeDeliveryRecipientsMutation.shopana';
import { addPromoCodeMutation } from '@src/modules/checkout/api/mutations/addPromoCodeMutation.shopana';
import { removePromoCodeMutation } from '@src/modules/checkout/api/mutations/removePromoCodeMutation.shopana';
import { updateCustomerNoteMutation } from '@src/modules/checkout/api/mutations/updateCustomerNoteMutation.shopana';
import { submitCheckoutMutation } from '@src/modules/checkout/api/mutations/submitCheckoutMutation.shopana';

import type { selectDeliveryMethodMutation as SelectDeliveryMethodMutationType } from '@src/modules/checkout/api/mutations/__generated__/selectDeliveryMethodMutation.graphql';
import type { selectPaymentMethodMutation as SelectPaymentMethodMutationType } from '@src/modules/checkout/api/mutations/__generated__/selectPaymentMethodMutation.graphql';
import type { updateCustomerIdentityMutation as UpdateCustomerIdentityMutationType } from '@src/modules/checkout/api/mutations/__generated__/updateCustomerIdentityMutation.graphql';
import type { addDeliveryAddressesMutation as AddDeliveryAddressesMutationType } from '@src/modules/checkout/api/mutations/__generated__/addDeliveryAddressesMutation.graphql';
import type { updateDeliveryAddressesMutation as UpdateDeliveryAddressesMutationType } from '@src/modules/checkout/api/mutations/__generated__/updateDeliveryAddressesMutation.graphql';
import type { removeDeliveryAddressesMutation as RemoveDeliveryAddressesMutationType } from '@src/modules/checkout/api/mutations/__generated__/removeDeliveryAddressesMutation.graphql';
import type { addPromoCodeMutation as AddPromoCodeMutationType } from '@src/modules/checkout/api/mutations/__generated__/addPromoCodeMutation.graphql';
import type { removePromoCodeMutation as RemovePromoCodeMutationType } from '@src/modules/checkout/api/mutations/__generated__/removePromoCodeMutation.graphql';
import type { updateCustomerNoteMutation as UpdateCustomerNoteMutationType } from '@src/modules/checkout/api/mutations/__generated__/updateCustomerNoteMutation.graphql';
import type { addDeliveryRecipientsMutation as AddDeliveryRecipientsMutationType } from '@src/modules/checkout/api/mutations/__generated__/addDeliveryRecipientsMutation.graphql';
import type { updateDeliveryRecipientsMutation as UpdateDeliveryRecipientsMutationType } from '@src/modules/checkout/api/mutations/__generated__/updateDeliveryRecipientsMutation.graphql';
import type { removeDeliveryRecipientsMutation as RemoveDeliveryRecipientsMutationType } from '@src/modules/checkout/api/mutations/__generated__/removeDeliveryRecipientsMutation.graphql';
import type { submitCheckoutMutation as SubmitCheckoutMutationType } from '@src/modules/checkout/api/mutations/__generated__/submitCheckoutMutation.graphql';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import { createCheckoutIdempotencyKey } from '@shopana/storefront-sdk/modules/cart/core/utils/idempotencyKey';

export function useCreateCheckoutApi(): CheckoutApi {
  const { checkout = null } = useCheckoutData() || {};

  const { commit: commitSelectDelivery } =
    useCheckoutOperation<SelectDeliveryMethodMutationType>(
      selectDeliveryMethodMutation,
      {
        errorMessage: 'Failed to select delivery method',
        operationKey: OperationKey.SelectDeliveryMethod,
        sectionId: SectionId.Delivery,
      }
    );

  const { commit: commitSelectPayment } =
    useCheckoutOperation<SelectPaymentMethodMutationType>(
      selectPaymentMethodMutation,
      {
        errorMessage: 'Failed to select payment method',
        operationKey: OperationKey.SelectPaymentMethod,
        sectionId: SectionId.Payment,
      }
    );

  const { commit: commitUpdateIdentity } =
    useCheckoutOperation<UpdateCustomerIdentityMutationType>(
      updateCustomerIdentityMutation,
      {
        errorMessage: 'Failed to update customer identity',
        operationKey: OperationKey.UpdateCustomerIdentity,
        sectionId: SectionId.Contact,
      }
    );

  const { commit: commitAddAddresses } =
    useCheckoutOperation<AddDeliveryAddressesMutationType>(
      addDeliveryAddressesMutation,
      {
        errorMessage: 'Failed to add delivery addresses',
        operationKey: OperationKey.AddDeliveryAddresses,
        sectionId: SectionId.Address,
      }
    );

  const { commit: commitUpdateAddresses } =
    useCheckoutOperation<UpdateDeliveryAddressesMutationType>(
      updateDeliveryAddressesMutation,
      {
        errorMessage: 'Failed to update delivery addresses',
        operationKey: OperationKey.UpdateDeliveryAddresses,
        sectionId: SectionId.Address,
      }
    );

  const { commit: commitRemoveAddresses } =
    useCheckoutOperation<RemoveDeliveryAddressesMutationType>(
      removeDeliveryAddressesMutation,
      {
        errorMessage: 'Failed to remove delivery addresses',
        operationKey: OperationKey.RemoveDeliveryAddresses,
        sectionId: SectionId.Address,
      }
    );

  const { commit: commitAddPromo } =
    useCheckoutOperation<AddPromoCodeMutationType>(addPromoCodeMutation, {
      errorMessage: 'Failed to add promo code',
      operationKey: OperationKey.AddPromoCode,
      sectionId: SectionId.Promo,
    });

  const { commit: commitRemovePromo } =
    useCheckoutOperation<RemovePromoCodeMutationType>(removePromoCodeMutation, {
      errorMessage: 'Failed to remove promo code',
      operationKey: OperationKey.RemovePromoCode,
      sectionId: SectionId.Promo,
    });

  const { commit: commitUpdateNote } =
    useCheckoutOperation<UpdateCustomerNoteMutationType>(
      updateCustomerNoteMutation,
      {
        errorMessage: 'Failed to update customer note',
        operationKey: OperationKey.UpdateCustomerNote,

        debounceMs: 250,
        sectionId: SectionId.Comment,
      }
    );

  const { commit: commitSubmitCheckout } =
    useCheckoutOperation<SubmitCheckoutMutationType>(
    submitCheckoutMutation,
    {
      errorMessage: 'Failed to submit checkout',
      operationKey: OperationKey.SubmitCheckout,
    }
  );

  const { commit: commitAddRecipients } =
    useCheckoutOperation<AddDeliveryRecipientsMutationType>(
    addDeliveryRecipientsMutation,
    {
      errorMessage: 'Failed to add delivery recipients',
      operationKey: OperationKey.AddDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );

  const { commit: commitUpdateRecipients } =
    useCheckoutOperation<UpdateDeliveryRecipientsMutationType>(
    updateDeliveryRecipientsMutation,
    {
      errorMessage: 'Failed to update delivery recipients',
      operationKey: OperationKey.UpdateDeliveryRecipients,
      sectionId: SectionId.Recipient,
    }
  );

  const { commit: commitRemoveRecipients } =
    useCheckoutOperation<RemoveDeliveryRecipientsMutationType>(
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
        expectedCheckoutVersion: checkout.version,
        idempotencyKey: createCheckoutIdempotencyKey(),
      };
    };

    return {
      selectDeliveryMethod: async (input) => {
        await commitSelectDelivery({ input: { ...input, ...mutationContext() } });
      },
      selectPaymentMethod: async (input) => {
        await commitSelectPayment({ input: { ...input, ...mutationContext() } });
      },
      updatePaymentMethod: async (input) => {
        await commitSelectPayment({ input: { ...input, ...mutationContext() } });
      },
      updateCustomerIdentity: async (input) => {
        await commitUpdateIdentity({ input: { ...input, ...mutationContext() } });
      },
      addDeliveryAddresses: async (input) => {
        await commitAddAddresses({ input: { ...input, ...mutationContext() } });
      },
      updateDeliveryAddresses: async (input) => {
        await commitUpdateAddresses({ input: { ...input, ...mutationContext() } });
      },
      removeDeliveryAddresses: async (input) => {
        await commitRemoveAddresses({ input: { ...input, ...mutationContext() } });
      },
      addDeliveryRecipients: async (input) => {
        await commitAddRecipients({ input: { ...input, ...mutationContext() } });
      },
      updateDeliveryRecipients: async (input) => {
        await commitUpdateRecipients({ input: { ...input, ...mutationContext() } });
      },
      removeDeliveryRecipients: async (input) => {
        await commitRemoveRecipients({ input: { ...input, ...mutationContext() } });
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
        await commitSelectDelivery({ input: { ...input, ...mutationContext() } });
      },
      submitCheckout: async (input) => {
        await commitSubmitCheckout({
          input: {
            ...input,
            ...mutationContext(),
            expectedResultRevision: checkout?.resultRevision ?? '',
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
