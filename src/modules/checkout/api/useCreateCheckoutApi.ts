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
import { addPromoCodeMutation } from '@src/modules/checkout/api/mutations/addPromoCodeMutation.shopana';
import { removePromoCodeMutation } from '@src/modules/checkout/api/mutations/removePromoCodeMutation.shopana';
import { updateCustomerNoteMutation } from '@src/modules/checkout/api/mutations/updateCustomerNoteMutation.shopana';

import type { selectDeliveryMethodMutation as SelectDeliveryMethodMutationType } from '@src/modules/checkout/api/mutations/__generated__/selectDeliveryMethodMutation.graphql';
import type { selectPaymentMethodMutation as SelectPaymentMethodMutationType } from '@src/modules/checkout/api/mutations/__generated__/selectPaymentMethodMutation.graphql';
import type { updateCustomerIdentityMutation as UpdateCustomerIdentityMutationType } from '@src/modules/checkout/api/mutations/__generated__/updateCustomerIdentityMutation.graphql';
import type { addDeliveryAddressesMutation as AddDeliveryAddressesMutationType } from '@src/modules/checkout/api/mutations/__generated__/addDeliveryAddressesMutation.graphql';
import type { updateDeliveryAddressesMutation as UpdateDeliveryAddressesMutationType } from '@src/modules/checkout/api/mutations/__generated__/updateDeliveryAddressesMutation.graphql';
import type { removeDeliveryAddressesMutation as RemoveDeliveryAddressesMutationType } from '@src/modules/checkout/api/mutations/__generated__/removeDeliveryAddressesMutation.graphql';
import type { addPromoCodeMutation as AddPromoCodeMutationType } from '@src/modules/checkout/api/mutations/__generated__/addPromoCodeMutation.graphql';
import type { removePromoCodeMutation as RemovePromoCodeMutationType } from '@src/modules/checkout/api/mutations/__generated__/removePromoCodeMutation.graphql';
import type { updateCustomerNoteMutation as UpdateCustomerNoteMutationType } from '@src/modules/checkout/api/mutations/__generated__/updateCustomerNoteMutation.graphql';

export function useCreateCheckoutApi(): CheckoutApi {
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
        sectionId: SectionId.Comment,
        debounceMs: 250,
      }
    );

  return useMemo(
    () => ({
      selectDeliveryMethod: async (input) => {
        await commitSelectDelivery({ input });
      },
      selectPaymentMethod: async (input) => {
        await commitSelectPayment({ input });
      },
      updatePaymentMethod: async (input) => {
        await commitSelectPayment({ input });
      },
      updateCustomerIdentity: async (input) => {
        await commitUpdateIdentity({ input });
      },
      addDeliveryAddresses: async (input) => {
        await commitAddAddresses({ input });
      },
      updateDeliveryAddresses: async (input) => {
        await commitUpdateAddresses({ input });
      },
      removeDeliveryAddresses: async (input) => {
        await commitRemoveAddresses({ input });
      },
      updateCustomerNote: async (input) => {
        await commitUpdateNote({ input });
      },
      addPromoCode: async (input) => {
        await commitAddPromo({ input });
      },
      removePromoCode: async (input) => {
        await commitRemovePromo({ input });
      },
      updateShippingMethod: async (input) => {
        await commitSelectDelivery({ input });
      },
      submitCheckout: async () => {
        throw new Error('Not implemented');
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}
