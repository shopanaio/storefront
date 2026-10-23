export {
  useConfirmMarketingSubscription,
  useMarketingSubscribe,
  type MarketingSubscribeValues,
  type MarketingSubscriptionErrorCode,
} from './useMarketingSubscription';
export type { MarketingSubscriptionResult } from '../../../graphql/apollo/generated/operations';
export {
  StorefrontRequestError,
  isStorefrontRequestError,
  type StorefrontRequestErrorKind,
  type StorefrontUserError,
} from '../../../core/StorefrontRequestError';
