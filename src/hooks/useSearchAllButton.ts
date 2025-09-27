import { useTranslations, useLocale } from "next-intl";

/**
 * Hook that provides props for "Show all" search button
 * @param searchTerm - The search term to build URL and label for
 * @returns Object with href and label for the search button
 */
export const useSearchAllButton = (searchTerm: string) => {
  const t = useTranslations("Header");
  const locale = useLocale();

  const href = `/${locale}/search?q=${encodeURIComponent(searchTerm)}`;
  const label = `${t("show-all")} "${searchTerm}"`;

  return {
    href,
    label,
  };
};
