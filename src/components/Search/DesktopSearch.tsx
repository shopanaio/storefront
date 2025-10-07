import { useRef, useEffect, useState } from 'react';
import { Popover, Button } from 'antd';
import SearchResults from './SearchResults';
import { useSearchInput } from '@src/hooks/useSearchInput';
import { mq } from '@src/components/Theme/breakpoints';
import { createStyles } from 'antd-style';
import { useElementWidth } from '@src/hooks/useElementWidth';
import { SearchInput } from './SearchInput';
import { useIsMobile } from '@src/hooks/useIsMobile';
import { useModalStore } from '@src/store/appStore';
import { useInitialLoading } from '@src/hooks/useInitialLoading';
import usePredictiveSearch from '@src/hooks/search/usePredictiveSearch';
import { useSearchAllButton } from '@src/hooks/useSearchAllButton';

export const DesktopSearch: React.FC = () => {
  const { searchTerm, debouncedTerm } = useSearchInput('', 300);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const isMobile = useIsMobile();
  const setIsSearchDialogOpen = useModalStore(
    (state) => state.setSearchDialogOpen
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const popoverWidth = useElementWidth(containerRef);
  const { styles } = useStyles();
  const initialLoading = useInitialLoading(isPopoverOpen, 300);

  // Get search results for button
  const { products } = usePredictiveSearch(debouncedTerm);

  // Get search all button props
  const { href, label } = useSearchAllButton(debouncedTerm);

  useEffect(() => {
    if (searchTerm.trim() && !isMobile) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  }, [searchTerm, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        containerRef.current &&
        popoverContentRef.current &&
        !containerRef.current.contains(target) &&
        !popoverContentRef.current.contains(target)
      ) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsPopoverOpen]);

  const handleClick = () => {
    if (isMobile) {
      setIsSearchDialogOpen(true);
    } else if (searchTerm.trim().length > 0) {
      setIsPopoverOpen(true);
    }
  };

  return (
    <div className={styles.inputContainer} ref={containerRef}>
      <Popover
        placement="bottom"
        arrow={false}
        open={isPopoverOpen && !isMobile}
        styles={{
          body: {
            width: popoverWidth,
          },
        }}
        content={
          <div className={styles.popover} ref={popoverContentRef}>
            <SearchResults
              searchTerm={debouncedTerm}
              initialLoading={initialLoading}
            />
            {debouncedTerm.trim() !== '' && products.length > 0 && (
              <div className={styles.buttonWrapper}>
                <Button block href={href}>
                  {label}
                </Button>
              </div>
            )}
          </div>
        }
      >
        <SearchInput onClick={handleClick} />
      </Popover>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    inputContainer: css`
      order: 999;
      display: flex;
      flex-grow: 1;
      width: 100%;

      ${mq.lg} {
        order: 3;
        width: auto;
      }
    `,
    popover: css`
      display: flex;
      flex-direction: column;
      min-height: 300px;
      max-height: 500px;
      overflow-y: auto;
    `,
    buttonWrapper: css`
      padding: ${token.paddingXS}px;
      margin-top: auto;
    `,
  };
});
