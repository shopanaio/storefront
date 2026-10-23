import type { model } from '../../../model/namespace';
import type { SdkStorefrontPromotionFragment } from '../../../graphql/apollo/generated/operations';

type ApiMoney = { readonly amount: unknown; readonly currencyCode: string };

const toNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toMoney = (money: ApiMoney | null | undefined): model.Money | null =>
  money
    ? { amount: toNumber(money.amount), currencyCode: money.currencyCode }
    : null;

const toDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Maps the `SdkStorefrontPromotion` fragment to the public promotion entity. */
export function mapStorefrontPromotion(
  promotion: Omit<SdkStorefrontPromotionFragment, '__typename'>
): model.StorefrontPromotion {
  const { presentation, value } = promotion;
  return {
    key: promotion.key,
    kind: promotion.kind,
    headline: presentation.headline,
    badge: presentation.badge,
    description: presentation.description
      ? {
          text: presentation.description.text,
          html: String(presentation.description.html),
        }
      : null,
    accessibilityLabel: presentation.accessibilityLabel,
    terms: presentation.terms ?? null,
    value: value
      ? {
          type: value.type,
          percentage:
            value.percentage == null ? null : toNumber(value.percentage),
          amount: toMoney(value.amount),
          maximumDiscount: toMoney(value.maximumDiscount),
          maximumShippingPrice: toMoney(value.maximumShippingPrice),
          buyQuantity: value.buyQuantity ?? null,
          getQuantity: value.getQuantity ?? null,
        }
      : null,
    minimumSubtotal: toMoney(promotion.minimumSubtotal),
    minimumQuantity: promotion.minimumQuantity ?? null,
    startsAt: toDate(promotion.startsAt) ?? new Date(0),
    endsAt: toDate(promotion.endsAt),
  };
}
