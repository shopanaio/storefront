import { usePreloadedQuery, useRelayEnvironment } from "react-relay";
import { useSerializablePreloadedQuery } from "@shopana/storefront-sdk/next/relay/client";
import HomePageQueryNode from "@src/hooks/home/HomePageQuery/__generated__/HomePageQuery.graphql";
import { HomePageQuery } from "@src/hooks/home/HomePageQuery/__generated__/HomePageQuery.graphql";
import { ProductSlideShowRelay_category$key } from "@src/components/Home/ProductSlideshow/__generated__/ProductSlideShowRelay_category.graphql";
import { HomeSectionType, Section } from "@src/components/Home/sections";
import { HomeSection } from "@src/components/Home/Home";
import { HomePageData } from "@src/hooks/home/interface";
import { useQuery } from "@src/providers/relay-query-provider";

const useHomeClientQuery = (): HomePageData => {
  const environment = useRelayEnvironment();
  const preloadedQuery = useQuery<HomePageQuery>();

  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery
  );

  const data = usePreloadedQuery<HomePageQuery>(
    HomePageQueryNode,
    queryReference
  );

  const { electronics, sport, toys, homeAndGarden } = data;

  const sections: HomeSection[] = [];

  if (electronics) {
    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "electronics", {
        title: electronics.title,
        sources: [electronics as ProductSlideShowRelay_category$key],
        pagination: true,
      })
    );
  }

  if (0 && homeAndGarden?.children?.edges?.length) {
    const childCategories = homeAndGarden.children.edges.map(
      (edge) => edge.node as ProductSlideShowRelay_category$key
    );

    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "homeAndGarden", {
        title: homeAndGarden.title,
        sources: childCategories,
        pagination: true,
      })
    );
  }

  if (sport) {
    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "sport", {
        title: sport.title,
        sources: [sport as ProductSlideShowRelay_category$key],
        pagination: true,
      })
    );
  }

  if (toys) {
    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "toys", {
        title: toys.title,
        sources: [toys as ProductSlideShowRelay_category$key],
        pagination: true,
      })
    );
  }

  return sections;
};

export default useHomeClientQuery;
