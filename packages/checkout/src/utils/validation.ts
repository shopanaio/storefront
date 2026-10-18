import type { ValidationError } from 'yup';
import * as yup from 'yup';
import { resolveProviderConfig } from '#checkout/infra/resolveProviderConfig';
import { ProviderModuleType } from '#checkout/vendors/types';
import { validateCustomerInput } from '#checkout/utils/jsonSchema';

/**
 * Extracts validation errors from a Yup ValidationError
 * and returns them as a Record<string, string>
 */
export function extractYupErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object') {
    return {};
  }

  if ('inner' in error) {
    const validationError = error as ValidationError;
    return validationError.inner.reduce<Record<string, string>>((acc, err) => {
      if (err.path) {
        acc[err.path] = err.message;
      }
      return acc;
    }, {});
  }

  return {};
}

/**
 * Base shape required for provider methods used in checkout (payment/delivery).
 */
export interface ProviderMethodBase {
  code: string;
  provider: string;
  data: unknown;
  customerInputContract?: unknown;
}

/**
 * Builds a reusable Yup schema for validating a selected provider method field
 * (e.g., selectedPaymentMethod or selectedDeliveryMethod).
 *
 * It ensures that a value is selected. With `validateCustomerInput`, the attached `data`
 * must satisfy the method's `customerInputContract` from the API. With
 * `requireMethodModule`, a selected method that no provider module declares is invalid
 * (such a method is hidden, so the customer has to pick another one).
 *
 * Note: This test is async due to provider config resolution.
 */
export function buildSelectedProviderMethodSchema<
  T extends ProviderMethodBase,
  S extends yup.ObjectSchema<any, any, any, any>
>(params: {
  moduleType: ProviderModuleType;
  baseSchema: S;
  requireMethodModule?: boolean;
  validateCustomerInput?: boolean;
  messages?: {
    required?: string;
    notSelected?: string;
    invalid?: string;
    unavailable?: string;
  };
}): S {
  const {
    moduleType,
    baseSchema,
    requireMethodModule = false,
    validateCustomerInput: checkInput = false,
    messages,
  } = params;

  const requiredMsg = messages?.required ?? 'A method must be selected';
  const notSelectedMsg = messages?.notSelected ?? 'A method must be selected';
  const invalidMsg = messages?.invalid ?? 'Invalid method data';
  const unavailableMsg = messages?.unavailable ?? 'The method is unavailable';

  const enhanced = baseSchema
    .required(requiredMsg)
    .test('is-selected', notSelectedMsg, (value) => value !== null && value !== undefined)
    .test(
      'by-provider-method',
      invalidMsg,
      async function (selectedMethod) {
        if (!selectedMethod) {
          return false;
        }

        const { code, provider, data, customerInputContract } =
          selectedMethod as T;

        if (requireMethodModule) {
          const config = await resolveProviderConfig(moduleType, provider);
          if (!config?.methods.some((m) => m.code === code)) {
            return this.createError({ message: unavailableMsg });
          }
        }

        if (
          checkInput &&
          validateCustomerInput(customerInputContract, data).length > 0
        ) {
          return this.createError({ message: invalidMsg });
        }

        return true;
      }
    );

  return enhanced as S;
}
