'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  SdkContactRequestCreateDocument,
  SdkContactRequestFormDocument,
  type ContactRequestCreateErrorCode,
  type SdkContactRequestCreateMutation,
  type SdkContactRequestFormQuery,
} from '../../../graphql/apollo/generated/operations';
import { runStorefrontMutation } from '../../../core/StorefrontRequestError';

export type ContactRequestForm = NonNullable<
  SdkContactRequestFormQuery['contactRequestForm']
>;
export type ContactRequestReceipt = NonNullable<
  SdkContactRequestCreateMutation['contactRequestCreate']['contactRequest']
>;

export interface ContactRequestFormState {
  /**
   * Null when the store does not take call-back requests: the Contact Requests App is not
   * active, the form is off, there is no published privacy policy or the credential lacks
   * `storefront.contact.write`. The form is then not shown.
   */
  form: ContactRequestForm | null;
  loading: boolean;
  error: Error | null;
  /** Reads the form again, e.g. after `DISCLOSURES_CHANGED`. */
  refetch(): Promise<ContactRequestForm | null>;
}

/** The call-back request form of the store: field limits and the personal data notice. */
export function useContactRequestForm(): ContactRequestFormState {
  const query = useQuery(SdkContactRequestFormDocument, {
    fetchPolicy: 'cache-first',
  });
  const { refetch: apolloRefetch } = query;
  const refetch = React.useCallback(
    async () =>
      (await apolloRefetch().catch(() => null))?.data?.contactRequestForm ??
      null,
    [apolloRefetch]
  );
  return {
    form: query.data?.contactRequestForm ?? null,
    loading: query.loading && !query.data,
    error: query.error ?? null,
    refetch,
  };
}

export interface ContactRequestValues {
  /** Phone to call back in E.164, e.g. `+380671234567`. */
  phone: string;
  name?: string;
  message?: string;
  /** Relative storefront path the form was sent from, e.g. `/products/box`. */
  sourcePath?: string;
  /** `contactRequestForm.disclosure.version` the buyer saw. */
  disclosureVersion: string;
}

/**
 * Sends a call-back request. Store, language, customer and network data come from the signed
 * storefront context; the receipt holds no personal data. Rejects with
 * `StorefrontRequestError<ContactRequestCreateErrorCode>`: `INVALID_PHONE`, `INVALID_INPUT`,
 * `DISCLOSURES_CHANGED` (read the form again), `RATE_LIMITED`, `UNAVAILABLE`,
 * `IDEMPOTENCY_CONFLICT`.
 */
export function useCreateContactRequest(): readonly [
  (values: ContactRequestValues) => Promise<ContactRequestReceipt>,
  boolean,
] {
  const [mutate, state] = useMutation(SdkContactRequestCreateDocument);
  const create = React.useCallback(
    (values: ContactRequestValues) =>
      runStorefrontMutation<
        SdkContactRequestCreateMutation['contactRequestCreate'],
        ContactRequestReceipt,
        ContactRequestCreateErrorCode
      >(
        async () =>
          (
            await mutate({
              variables: {
                input: {
                  phone: values.phone,
                  name: values.name?.trim() || null,
                  message: values.message?.trim() || null,
                  sourcePath: values.sourcePath ?? null,
                  disclosureVersion: values.disclosureVersion,
                  // A new key per submission: a retried request is applied once.
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            })
          ).data?.contactRequestCreate,
        (payload) => payload.contactRequest
      ),
    [mutate]
  );
  return [create, state.loading] as const;
}
