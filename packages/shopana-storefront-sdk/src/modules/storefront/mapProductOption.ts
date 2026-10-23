import type { ProductOption } from '../../model/Product/ProductOption';
import type { SdkProductOptionsQuery } from '../../graphql/apollo/generated/operations';

type ApiOption = NonNullable<
  SdkProductOptionsQuery['product']
>['options'][number];

export function mapStorefrontProductOption(option: ApiOption): ProductOption {
  return {
    id: option.id,
    handle: option.handle,
    title: option.name,
    type: option.type
      ? {
          id: option.type.id,
          name: option.type.name,
          handle: option.type.handle,
        }
      : null,
    displayType: option.optionValues.some((value) => value.swatch)
      ? 'SWATCH'
      : 'RADIO',
    values: option.optionValues.map((value) => {
      const swatch = value.swatch;
      const media = swatch?.image;
      return {
        id: value.id,
        handle: value.handle,
        title: value.name,
        swatch: swatch
          ? {
              id: `${value.id}:swatch`,
              color: swatch.color == null ? '' : String(swatch.color),
              color2:
                swatch.secondaryColor == null
                  ? null
                  : String(swatch.secondaryColor),
              displayType:
                swatch.type === 'GRADIENT'
                  ? 'COLOR_DUO'
                  : swatch.type === 'IMAGE'
                    ? 'IMAGE'
                    : 'COLOR',
              image:
                media?.__typename === 'MediaImage'
                  ? { id: media.id, url: String(media.image.url) }
                  : null,
            }
          : null,
      };
    }),
  };
}
