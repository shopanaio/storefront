import { useMutation } from 'react-relay';

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
import { CheckoutApi } from '@src/modules/checkout/api/interface';

export function useCheckoutApi(): CheckoutApi {
  const [commitSelectDelivery] = useMutation<SelectDeliveryMethodMutationType>(
    selectDeliveryMethodMutation
  );

  const [commitSelectPayment] = useMutation<SelectPaymentMethodMutationType>(
    selectPaymentMethodMutation
  );

  const [commitUpdateIdentity] =
    useMutation<UpdateCustomerIdentityMutationType>(
      updateCustomerIdentityMutation
    );

  const [commitAddAddresses] = useMutation<AddDeliveryAddressesMutationType>(
    addDeliveryAddressesMutation
  );

  const [commitUpdateAddresses] =
    useMutation<UpdateDeliveryAddressesMutationType>(
      updateDeliveryAddressesMutation
    );

  const [commitRemoveAddresses] =
    useMutation<RemoveDeliveryAddressesMutationType>(
      removeDeliveryAddressesMutation
    );

  const [commitAddPromo] =
    useMutation<AddPromoCodeMutationType>(addPromoCodeMutation);

  const [commitRemovePromo] = useMutation<RemovePromoCodeMutationType>(
    removePromoCodeMutation
  );

  const [commitUpdateNote] = useMutation<UpdateCustomerNoteMutationType>(
    updateCustomerNoteMutation
  );

  return {
    selectDeliveryMethod: (input) =>
      new Promise((resolve, reject) => {
        commitSelectDelivery({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    selectPaymentMethod: (input) =>
      new Promise((resolve, reject) => {
        commitSelectPayment({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    updatePaymentMethod: (input) =>
      new Promise((resolve, reject) => {
        commitSelectPayment({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    updateCustomerIdentity: (input) =>
      new Promise((resolve, reject) => {
        commitUpdateIdentity({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    addDeliveryAddresses: (input) =>
      new Promise((resolve, reject) => {
        commitAddAddresses({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    updateDeliveryAddresses: (input) =>
      new Promise((resolve, reject) => {
        commitUpdateAddresses({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    removeDeliveryAddresses: (input) =>
      new Promise((resolve, reject) => {
        commitRemoveAddresses({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    updateCustomerNote: (input) =>
      new Promise((resolve, reject) => {
        commitUpdateNote({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    addPromoCode: (input) =>
      new Promise((resolve, reject) => {
        commitAddPromo({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    removePromoCode: (input) =>
      new Promise((resolve, reject) => {
        commitRemovePromo({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    updateShippingMethod: (input) =>
      new Promise((resolve, reject) => {
        commitSelectDelivery({
          variables: { input },
          onCompleted: (res, errs) => {
            if (errs && errs.length) return reject(errs);
            resolve();
          },
          onError: reject,
        });
      }),
    submitCheckout: () =>
      new Promise((_, reject) => {
        reject(new Error('Not implemented'));
      }),
  };
}
