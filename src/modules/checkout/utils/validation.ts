import type { ValidationError } from 'yup';
import * as yup from 'yup';
import { resolveProviderConfig } from '@src/modules/checkout/infra/resolveProviderConfig';
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';

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
}

/**
 * Builds a reusable Yup schema for validating a selected provider method field
 * (e.g., selectedPaymentMethod or selectedDeliveryMethod).
 *
 * It ensures that a value is selected, and if the corresponding provider method
 * defines its own data schema, validates the attached `data` against it.
 *
 * Note: This test is async due to provider config resolution.
 */
export function buildSelectedProviderMethodSchema<
  T extends ProviderMethodBase,
  S extends yup.ObjectSchema<any, any, any, any>
>(params: {
  moduleType: ProviderModuleType;
  baseSchema: S;
  messages?: {
    required?: string;
    notSelected?: string;
    invalid?: string;
  };
}): S {
  const { moduleType, baseSchema, messages } = params;

  const requiredMsg = messages?.required ?? 'A method must be selected';
  const notSelectedMsg = messages?.notSelected ?? 'A method must be selected';
  const invalidMsg = messages?.invalid ?? 'Invalid method data';

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

        const { code, provider, data } = selectedMethod as T;
        const config = await resolveProviderConfig(moduleType, provider);

        const methodConfig = config?.methods.find((m) => m.code === code);
        if (!methodConfig?.schema) {
          return true;
        }

        try {
          methodConfig.schema.validateSync(data, { abortEarly: false });
          return true;
        } catch (e) {
          return this.createError({ message: (e as Error).message });
        }
      }
    );

  return enhanced as S;
}
