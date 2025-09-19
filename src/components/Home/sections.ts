import HomeSliderWithBanner, {
  HomeSliderWithBannerProps,
} from "./SlideshowWithBanner/SectionSlideShowWithBanner";
import VideoBanner, { VideoBannerProps } from "./Player/VideoBanner";
import CategoryGridSection, {
  CategoryGridSectionProps,
} from "./Category-grid/CategoryGridSection";
import { ProductSlideShow, ProductSlideShowProps } from "@src/components/Home/ProductSlideshow/ProductSlideShow";

export enum HomeSectionType {
  ProductSlideshow = "productSlideshow",
  ProductSlideshowWithBanner = "productSlideshowWithBanner",
  Player = "player",
  Grid = "grid",
}

export type SectionSettings =
  | ProductSlideShowProps
  | HomeSliderWithBannerProps
  | VideoBannerProps
  | CategoryGridSectionProps;

export const Sections = {
  [HomeSectionType.ProductSlideshow]: ProductSlideShow,
  [HomeSectionType.ProductSlideshowWithBanner]: HomeSliderWithBanner,
  [HomeSectionType.Player]: VideoBanner,
  [HomeSectionType.Grid]: CategoryGridSection,
};

export class Section {
  static create<
    Type extends HomeSectionType,
    Settings extends React.ComponentProps<(typeof Sections)[Type]>
  >(type: Type, id: string, settings: Settings) {
    return {
      id,
      type,
      settings,
    };
  }
}
