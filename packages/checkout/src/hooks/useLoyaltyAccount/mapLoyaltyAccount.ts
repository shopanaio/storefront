import type { model } from '@shopana/storefront-sdk';
import type { LoyaltyAccount as ApiAccount } from '@shopana/storefront-sdk/modules/customer/react';
import type { Checkout } from '#checkout/types/entity';

type ApiMoney = ApiAccount['redemptionSources'][number]['availableAmount'];

const mapMoney = (money: ApiMoney): model.Money => {
  const amount = Number(money.amount ?? 0);
  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currencyCode: money.currencyCode,
  };
};

const toDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const mapBound = (
  bound: ApiAccount['redemptionSources'][number]['minimum']
): Checkout.LoyaltyBound => ({
  points: bound.points ?? null,
  amount: mapMoney(bound.amount),
});

const mapStoreCredit = (
  credit: ApiAccount['storeCredit']
): Checkout.LoyaltyStoreCredit | null => {
  if (!credit) return null;
  const expiration = credit.upcomingExpirations[0];
  const expiresAt = toDate(expiration?.expiresAt);
  return {
    availableAmount: mapMoney(credit.availableAmount),
    pendingAmount: mapMoney(credit.pendingAmount),
    nextExpiration:
      expiration && expiresAt
        ? { amount: mapMoney(expiration.amount), expiresAt }
        : null,
  };
};

/** Maps the loyalty account of the signed-in customer to the checkout entity. */
export function mapLoyaltyAccount(
  account: ApiAccount
): Checkout.LoyaltyAccount {
  const expiration = account.upcomingExpirations[0];
  const expiresAt = toDate(expiration?.expiresAt);
  return {
    id: account.id,
    status: account.status,
    availablePoints: account.balance.availablePoints,
    pendingPoints: account.balance.pendingPoints,
    tier: account.tier
      ? {
          name: account.tier.name,
          earnMultiplierBps: account.tier.earnMultiplierBps,
          progress: account.tier.progress?.presentation.headline ?? null,
        }
      : null,
    nextExpiration:
      expiration && expiresAt ? { points: expiration.points, expiresAt } : null,
    storeCredit: mapStoreCredit(account.storeCredit),
    sources: account.redemptionSources.map((option) => ({
      source: option.source,
      availablePoints: option.availablePoints ?? null,
      availableAmount: mapMoney(option.availableAmount),
      minimum: mapBound(option.minimum),
      maximumPerOrder: option.maximumPerOrder
        ? mapBound(option.maximumPerOrder)
        : null,
    })),
    rewards: account.availableRewards.nodes.map((reward) => ({
      id: reward.id,
      kind: reward.reward.kind,
      headline: reward.presentation.headline,
      description: reward.presentation.description ?? null,
      validUntil: toDate(reward.validUntil),
      voucherCode: reward.discountCode ?? null,
    })),
  };
}
