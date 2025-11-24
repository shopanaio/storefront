import { Flex, Empty } from 'antd';
import { SearchProductCard } from './SearchProductCard';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import type { model } from '@shopana/storefront-sdk';

interface SearchResultsContentProps {
  products: model.Product[];
  searchTerm: string;
}

const SearchResultsContent: React.FC<SearchResultsContentProps> = ({
  products,
  searchTerm,
}) => {
  const t = useTranslations('Header');
  const { styles } = useStyles();

  const renderContent = () => {
    const hasSearchTerm = searchTerm.trim() !== '';

    if (!hasSearchTerm || products.length === 0) {
      return (
        <Empty
          className={styles.styledEmpty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={hasSearchTerm ? 'No Data' : t('start-typing-to-search')}
        />
      );
    }

    return products.map((product) => (
      <SearchProductCard key={product.id} item={product} />
    ));
  };

  return (
    <Flex className={styles.container} vertical>
      {renderContent()}
    </Flex>
  );
};

export default SearchResultsContent;

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      height: 100%;
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
  };
});
