import { usePreloadedQuery, useRelayEnvironment } from "react-relay";
import useSerializablePreloadedQuery from "@shopana/storefront-sdk/next/relay/useSerializablePreloadedQuery";
import HomePageQueryNode from "@src/hooks/home/HomePageQuery/__generated__/HomePageQuery.graphql";
import { HomePageQuery } from "@src/hooks/home/HomePageQuery/__generated__/HomePageQuery.graphql";
import { ProductSlideShowRelayShopify_category$key } from "@src/components/Home/ProductSlideshow/__generated__/ProductSlideShowRelayShopify_category.graphql";
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

  const { electronics, jevelery, toys, garden } = data;

  const sections: HomeSection[] = [];

  if (electronics) {
    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "electronics", {
        title: electronics.title,
        sources: [electronics as ProductSlideShowRelayShopify_category$key],
        pagination: true,
      })
    );
  }

  if (jevelery) {
    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "jevelery", {
        title: jevelery.title,
        sources: [jevelery as ProductSlideShowRelayShopify_category$key],
        pagination: true,
      })
    );
  }

  if (toys) {
    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "toys", {
        title: toys.title,
        sources: [toys as ProductSlideShowRelayShopify_category$key],
        pagination: true,
      })
    );
  }

  if (garden) {
    sections.push(
      Section.create(HomeSectionType.ProductSlideshow, "garden", {
        title: garden.title,
        sources: [garden as ProductSlideShowRelayShopify_category$key],
        pagination: true,
      })
    );
  }

  return sections;
};

export default useHomeClientQuery;
