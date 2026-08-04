import { Button, Input } from 'antd';
import { Search } from 'lucide-react';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import React from 'react';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import { useModalStore } from '@src/store/appStore';
import { useIsMobile } from '@src/hooks/useIsMobile';
import { useRoutes } from '@src/hooks/useRoutes';

type SearchInputProps = {
  onClick?: () => void;
  iconSize?: number;
  showSubmitButton?: boolean;
  placeholder?: string;
  submitLabel?: string;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  onClick,
  ref,
  iconSize = 18,
  showSubmitButton = true,
  placeholder,
  submitLabel,
}) => {
  const routes = useRoutes();
  const t = useTranslations('Header');
  const { styles } = useStyles();
  const searchTerm = useModalStore((state) => state.searchTerm);
  const setSearchTerm = useModalStore((state) => state.setSearchTerm);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Button
        className={styles.mobileSearch}
        icon={<Search className={styles.searchIcon} size={iconSize} />}
        onClick={onClick}
        block
      >
        {t('search')}
      </Button>
    );
  }

  return (
    <Input
      ref={ref}
      allowClear
      size="middle"
      readOnly={isMobile}
      className={styles.searchInput}
      placeholder={placeholder ?? `${t('search')} ...`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      prefix={<Search className={styles.searchIcon} size={iconSize} />}
      onClick={onClick}
      suffix={
        showSubmitButton ? (
          <Button
            href={
              searchTerm.trim() ? routes.search.path(searchTerm) : undefined
            }
            type="primary"
            className={styles.searchButton}
          >
            {submitLabel ?? t('search')}
          </Button>
        ) : null
      }
    />
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    searchInput: css`
      width: 100%;
      color: var(--header-text-color, ${token.colorText});
      background-color: var(--header-search-background, transparent);
      border-color: var(--header-search-border, ${token.colorBorder});
      padding-right: ${token.paddingXXS}px;

      ${mq.lg} {
        height: var(--components-header-control-height);
      }
    `,
    searchIcon: css`
      color: var(--header-icon-color, ${token.colorTextPlaceholder});
    `,
    searchButton: css`
      color: var(--header-primary-button-text, ${token.colorTextLightSolid});
      background: var(
        --header-primary-button-background,
        ${token.colorPrimary}
      );
      border-color: var(
        --header-primary-button-background,
        ${token.colorPrimary}
      );

      &:not(:disabled):not(.ant-btn-disabled):hover {
        color: var(--header-primary-button-text, ${token.colorTextLightSolid});
        background: var(
          --header-primary-button-background,
          ${token.colorPrimary}
        );
        border-color: var(
          --header-primary-button-background,
          ${token.colorPrimary}
        );
        filter: brightness(0.95);
      }

      ${mq.max.lg} {
        display: none;
      }
    `,
    mobileSearch: css`
      justify-content: flex-start;
      color: var(--header-text-color, ${token.colorTextPlaceholder});
      background: var(--header-search-background, transparent);
      border-color: var(--header-search-border, ${token.colorBorder});
    `,
  };
});

export default SearchInput;
