import { useState } from "react";
import { Flex, Button, Typography, Empty } from "antd";
import { SearchProductCard } from "./SearchProductCard";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { ApiArticle, ApiCategory, ApiProduct } from "@codegen/schema-client";
import { useLocale } from "next-intl";

const { Text } = Typography;

interface SearchResultsContentProps {
  products: ApiProduct[];
  categories?: ApiCategory[];
  articles?: ApiArticle[];
  searchTerm: string;
}

const SearchResultsContent: React.FC<SearchResultsContentProps> = ({
  products,
  categories = [],
  articles = [],
  searchTerm,
}) => {
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "articles"
  >("products");
  const t = useTranslations("Header");
  const { styles } = useStyles();
  const locale = useLocale();

  if (searchTerm.trim() === "") {
    return null;
  }

  const renderContent = () => {
    if (activeTab === "products") {
      return products.length === 0 ? (
        <Empty
          className={styles.styledEmpty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No Data"
        />
      ) : (
        products.map((product) => (
          <SearchProductCard key={product.id} item={product} />
        ))
      );
    }

    if (activeTab === "categories") {
      return categories.map((category) => (
        <SearchProductCard key={category.id} item={category} />
      ));
    }

    if (activeTab === "articles") {
      return articles.map((article) => (
        <SearchProductCard key={article.id} item={article} />
      ));
    }

    return null;
  };

  // Skeleton is now handled by Suspense fallback

  return (
    <Flex className={styles.container} vertical>
      <Text className={styles.title} strong>
        {t("search-result")}
      </Text>
      <Flex className={styles.searchFilterBtnsWrapper}>
        <Button
          className={styles.searchFilterBtn}
          type={activeTab === "products" ? "primary" : "default"}
          size="small"
          onClick={() => setActiveTab("products")}
        >
          {t("products")}
        </Button>
        <Button
          className={styles.searchFilterBtn}
          type={activeTab === "categories" ? "primary" : "default"}
          size="small"
          onClick={() => setActiveTab("categories")}
          disabled={categories.length === 0}
        >
          {t("categories")}
        </Button>
        <Button
          className={styles.searchFilterBtn}
          type={activeTab === "articles" ? "primary" : "default"}
          size="small"
          onClick={() => setActiveTab("articles")}
          disabled={articles.length === 0}
        >
          {t("articles")}
        </Button>
      </Flex>
      <div className={styles.contentWrapper}>{renderContent()}</div>
      {activeTab === "products" && products.length > 0 && (
        <Button href={`/${locale}/search?q=${encodeURIComponent(searchTerm)}`}>
          {t("show-all")} &quot;{searchTerm}&quot;
        </Button>
      )}
    </Flex>
  );
};

export default SearchResultsContent;

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      padding: ${token.paddingXXS}px;
      flex-grow: 1;
      width: 100%;
      height: 100%;
    `,
    title: css`
      font-size: ${token.fontSizeLG}px;
      margin-bottom: ${token.marginXS}px;
    `,
    searchFilterBtnsWrapper: css`
      display: flex;
      gap: ${token.marginXS}px;
      margin-bottom: ${token.marginXS}px;
    `,
    skeletonBtnsWrapper: css`
      display: flex;
      gap: ${token.marginXS}px;
      margin-bottom: ${token.marginSM}px;
    `,
    skeletonProdList: css`
      gap: ${token.margin}px;
    `,
    searchFilterBtn: css`
      padding: 0 ${token.paddingSM}px;
    `,

    searchPendingWrapper: css`
      display: flex;
      flex-direction: column;
      padding: ${token.paddingSM}px ${token.paddingXXS}px ${token.paddingXS}px;
    `,
    skeletonTitleWrapper: css`
      margin-bottom: ${token.marginXS}px;
    `,
    styledEmpty: css`
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 238px;
      margin: 0;
    `,
    searchAllBtn: css`
      margin-top: auto;
    `,
    contentWrapper: css`
      flex-grow: 1;
    `,
  };
});
