import { useTranslations } from "next-intl";
import { useRoutes } from "@src/hooks/useRoutes";

/**
 * Hook that provides props for "Show all" search button
 * @param searchTerm - The search term to build URL and label for
 * @returns Object with href and label for the search button
 */
export const useSearchAllButton = (searchTerm: string) => {
  const t = useTranslations("Header");
  const routes = useRoutes();

  const href = routes.search.path(searchTerm);
  const label = `${t("show-all")} "${searchTerm}"`;

  return {
    href,
    label,
  };
};
