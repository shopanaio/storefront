import { mq } from "@src/components/Theme/breakpoints";
import { css } from "antd-style";

export interface GalleryBreakpointSettings {
  thumbnailDirection?: "vertical" | "horizontal";
  aspectRatio?: number;
  thumbnailSize?: number;
  thumbnailsPerView?: number;
  thumbnailsCount?: number;
  gridGap?: number;
}

const defaultVariables = (
  settings: GalleryBreakpointSettings,
  token: any
) => css`
  --grid-gap: ${settings.gridGap ?? token.margin}px;
  --thumb-qty: ${settings.thumbnailsPerView ?? 8};
  --thumb-count: ${settings.thumbnailsCount ?? 8}; /* total thumbnails */
  --thumb-gap: 8px;
  --thumb-size: ${settings.thumbnailSize ?? 72}px;
  --gallery-flex-direction: ${settings.thumbnailDirection === "vertical"
    ? "row-reverse"
    : "column"};
`;

const derivedVariables = (direction: "vertical" | "horizontal") => css`
  --thumb-total-gap: calc(var(--thumb-gap) * (var(--thumb-qty) - 1));
  --thumb-real-gap: calc(var(--thumb-gap) * (var(--thumb-count) - 1));
  --gallery-size: calc(
    var(--thumb-size) * var(--thumb-qty) + var(--thumb-total-gap)
  );

  ${direction === "vertical"
    ? css`
        --gallery-column-width: calc(
          var(--gallery-size) + (var(--thumb-gap) + var(--thumb-size))
        );
      `
    : css`
        --gallery-column-width: calc(var(--gallery-size) + var(--thumb-gap));
      `}

  --gallery-width: var(--gallery-size);
  --gallery-height: var(--gallery-size);

  ${direction === "vertical"
    ? css`
        --thumbnails-width: var(--thumb-size);
        --thumbnails-height: calc(
          var(--thumb-size) * var(--thumb-count) + var(--thumb-real-gap)
        );

        --gallery-container-width: var(--gallery-column-width);
        --gallery-container-height: var(--gallery-height);
      `
    : css`
        --thumbnails-width: calc(
          var(--thumb-size) * var(--thumb-count) + var(--thumb-real-gap)
        );
        --thumbnails-height: var(--thumb-size);
        --gallery-container-width: var(--gallery-size);
        --gallery-container-height: calc(
          var(--gallery-height) + var(--thumb-size) + var(--thumb-gap)
        );
      `}
`;

const layoutStyles = () => css`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: var(--grid-gap);

  ${mq.lg} {
    grid-template-columns: var(--gallery-column-width) 1fr;
  }
`;

const getCustomOverrides = (settings: GalleryBreakpointSettings) => {
  const overrides: string[] = [];

  if (settings.thumbnailsPerView) {
    overrides.push(`--thumb-qty: ${settings.thumbnailsPerView};`);
  }
  if (settings.thumbnailSize) {
    overrides.push(`--thumb-size: ${settings.thumbnailSize}px;`);
  }

  if (settings.thumbnailsCount) {
    overrides.push(`--thumb-count: ${settings.thumbnailsCount};`);
  }

  if (settings.aspectRatio) {
    overrides.push(
      `--gallery-aspect-ratio: ${settings.aspectRatio};`,
      `--gallery-height: calc(var(--gallery-width) / var(--gallery-aspect-ratio));`
    );
  }

  return overrides.join("\n      ");
};

export const getGalleryStyles = (
  breakpoints: Record<number, GalleryBreakpointSettings>,
  token: any
) => {
  const sortedBreakpoints = Object.entries(breakpoints).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return css`
    ${sortedBreakpoints.map(([breakpoint, settings]) => {
      const direction = settings.thumbnailDirection ?? "horizontal";
      const customOverrides = getCustomOverrides(settings);

      return css`
        @media (min-width: ${breakpoint}px) {
          /* 1. Defaults */
          ${defaultVariables(settings, token)}

          /* 2. Custom overrides */
          ${customOverrides}

          /* 3. Derived constants */
          ${derivedVariables(direction)}

          /* 4. Layout definitions */
          ${layoutStyles()}
        }
      `;
    })}

    @media (min-width: 1280px) {
      max-width: 1280px;
      margin: 0 auto;
    }

    @media (min-width: 1400px) {
      max-width: 1400px;
    }
  `;
};
