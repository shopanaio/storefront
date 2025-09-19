import { HomeSection } from "@src/components/Home/Home";

export interface CategoryData {
  title: string;
  handle?: string;
  id?: string;
}

export interface CategoryWithChildren extends CategoryData {
  children?: CategoryData[];
}

export interface HomeData {
  electronics: CategoryData | null;
  sport: CategoryData | null;
  toys: CategoryData | null;
  homeAndGarden: CategoryWithChildren | null;
}

export type HomePageData = HomeSection[];
