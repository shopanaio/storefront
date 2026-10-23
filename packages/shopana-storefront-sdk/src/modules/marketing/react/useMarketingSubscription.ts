'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  SdkMarketingSubscribeDocument,
  SdkMarketingSubscriptionConfirmDocument,
  type LocaleCode,
  type MarketingSubscriptionResult,
  type SdkMarketingSubscribeMutation,
  type SdkMarketingSubscriptionConfirmMutation,
} from '../../../graphql/apollo/generated/operations';
import { runStorefrontMutation } from '../../../core/StorefrontRequestError';

/**
 * Stable codes of a rejected subscription: `INVALID_EMAIL`, `INVALID_LOCALE`, `RATE_LIMITED`,
 * `MARKETING_SUBSCRIPTION_UNAVAILABLE` (the store has no storefront domain for the link),
 * `FORBIDDEN`; for a confirmation `INVALID_TOKEN` and `TOKEN_EXPIRED`.
 */
export type MarketingSubscriptionErrorCode =
  | 'INVALID_EMAIL'
  | 'INVALID_LOCALE'
  | 'INVALID_IDEMPOTENCY_KEY'
  | 'IDEMPOTENCY_CONFLICT'
  | 'RATE_LIMITED'
  | 'MARKETING_SUBSCRIPTION_UNAVAILABLE'
  | 'FORBIDDEN'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED';

export interface MarketingSubscribeValues {
  email: string;
  /** Language of the confirmation email; the request content language when omitted. */
  locale?: LocaleCode;
}

/**
 * Subscribes an email address to the store newsletter with double opt-in. Resolves to
 * `PENDING_CONFIRMATION` for a guest whatever the state of the address (a confirmation email is
 * sent when it can be subscribed), or `SUBSCRIBED` for a signed-in customer subscribing their
 * verified email. Rejects with `StorefrontRequestError<MarketingSubscriptionErrorCode>`.
 */
export function useMarketingSubscribe(): readonly [
  (values: MarketingSubscribeValues) => Promise<MarketingSubscriptionResult>,
  boolean,
] {
  const [mutate, state] = useMutation(SdkMarketingSubscribeDocument);
  const subscribe = React.useCallback(
    ({ email, locale }: MarketingSubscribeValues) =>
      runStorefrontMutation<
        SdkMarketingSubscribeMutation['marketingSubscribe'],
        MarketingSubscriptionResult,
        MarketingSubscriptionErrorCode
      >(
        async () =>
          (
            await mutate({
              variables: {
                input: {
                  email: email.trim(),
                  // A new key per submission: a retried request is applied once.
                  idempotencyKey: crypto.randomUUID(),
                  ...(locale ? { locale } : {}),
                },
              },
            })
          ).data?.marketingSubscribe,
        (payload) => payload.result
      ),
    [mutate]
  );
  return [subscribe, state.loading] as const;
}

/**
 * Confirms a subscription with the token of the confirmation link. Call it from an explicit
 * buyer action, not on page load: mail scanners open links automatically. Resolves to
 * `SUBSCRIBED`; rejects with `INVALID_TOKEN` or `TOKEN_EXPIRED` user errors.
 */
export function useConfirmMarketingSubscription(): readonly [
  (token: string) => Promise<MarketingSubscriptionResult>,
  boolean,
] {
  const [mutate, state] = useMutation(SdkMarketingSubscriptionConfirmDocument);
  const confirm = React.useCallback(
    (token: string) =>
      runStorefrontMutation<
        SdkMarketingSubscriptionConfirmMutation['marketingSubscriptionConfirm'],
        MarketingSubscriptionResult,
        MarketingSubscriptionErrorCode
      >(
        async () =>
          (await mutate({ variables: { input: { token } } })).data
            ?.marketingSubscriptionConfirm,
        (payload) => payload.result
      ),
    [mutate]
  );
  return [confirm, state.loading] as const;
}
