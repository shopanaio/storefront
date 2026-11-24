import type { model } from '../../../model/namespace';
import type {
  SdkProductCardFragment,
  SdkPromotionBenefitItemsFragment,
  SdkStorefrontPromotionFragment,
} from '../../../graphql/apollo/generated/operations';

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
    shortBadge: presentation.shortBadge ?? null,
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
    appliesOnOneTimePurchase: promotion.appliesOnOneTimePurchase,
    appliesOnSubscription: promotion.appliesOnSubscription,
    startsAt: toDate(promotion.startsAt) ?? new Date(0),
    endsAt: toDate(promotion.endsAt),
    placements: promotion.placements,
    benefitScope: promotion.benefitScope ?? null,
  };
}

/** Maps an `SdkProductCard` to the item it offers, with its benefit price when asked for. */
export function mapPromotionBenefitOffer(
  card: Omit<SdkProductCardFragment, '__typename'>,
  benefitPrice?: ApiMoney | null
): model.PromotionBenefitOffer {
  const { variant } = card;
  const cover =
    variant.cover?.__typename === 'MediaImage' ? variant.cover : null;
  return {
    variantId: variant.id,
    variantHandle: variant.handle,
    variantTitle: variant.title === card.title ? '' : variant.title,
    product: {
      id: card.productId,
      handle: card.handle,
      title: card.title,
      vendorName: card.vendor?.name ?? null,
    },
    imageUrl: cover?.image?.url ? String(cover.image.url) : null,
    price: toMoney(variant.price),
    compareAtPrice: toMoney(variant.compareAtPrice),
    benefitPrice: toMoney(benefitPrice),
    availableForSale: variant.availableForSale,
  };
}

/**
 * The benefit items the merchant chose for buy X get Y: the cards of its variants, or of each of
 * its products the storefront shows. Null when it chose neither.
 */
export function mapPromotionBenefitItems(
  promotion: Omit<SdkPromotionBenefitItemsFragment, '__typename'>
): model.PromotionBenefitOffer[] | null {
  const cards = promotion.benefitVariantCards ?? promotion.benefitProductCards;
  if (!cards) return null;
  return cards.flatMap((card) => (card ? [mapPromotionBenefitOffer(card)] : []));
}
