import { useRef, useEffect, useState } from "react";
import { Button, Input, Popover, Spin } from "antd";
import { TbSearch } from "react-icons/tb";
import SearchResults from "./SearchResults";
import { useSearchInput } from "@src/hooks/useSearchInput";
import { mq } from "@src/components/Theme/breakpoints";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { useElementWidth } from "@src/hooks/useElementWidth";
import { useLocale } from "next-intl";

export const DesktopSearch: React.FC = () => {
  const locale = useLocale();
  const { searchTerm, setSearchTerm, debouncedTerm } = useSearchInput(300);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const popoverWidth = useElementWidth(containerRef);
  const t = useTranslations("Header");
  const { styles } = useStyles();

  useEffect(() => {
    if (searchTerm.trim()) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  }, [searchTerm]);

  // popover width is now updated inside useElementWidth

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsPopoverOpen]);

  const handleFocus = () => {
    if (searchTerm.trim().length > 0) {
      setIsPopoverOpen(true);
    }
  };

  return (
    <div className={styles.inputContainer} ref={containerRef}>
      <Popover
        placement="bottom"
        arrow={false}
        open={isPopoverOpen}
        styles={{
          body: {
            width: popoverWidth,
          },
        }}
        content={
          <div className={styles.popover} ref={popoverContentRef}>
            <SearchResults searchTerm={debouncedTerm} />
          </div>
        }
      >
        <Input
          allowClear
          className={styles.searchInput}
          placeholder={`${t("search")} ...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<TbSearch className={styles.searchIcon} size={18} />}
          onFocus={handleFocus}
          suffix={
            <Button
              href={`${locale}/search?q=${encodeURIComponent(searchTerm)}`}
              type="primary"
            >
              {t("search")}
            </Button>
          }
        />
      </Popover>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    inputContainer: css`
      order: 6;
      display: flex;
      flex-grow: 1;
      width: auto;
      height: var(--components-header-control-height);

      ${mq.max.sm} {
        display: none;
      }
      ${mq.lg} {
        order: 3;
      }
    `,
    searchInput: css`
      width: 100%;
      padding: ${token.paddingXXS} ${token.paddingXS};
      background-color: transparent;
    `,
    searchIcon: css`
      color: ${token.colorTextPlaceholder};
    `,
    popover: css`
      display: flex;
      flex-direction: column;
      min-height: 300px;
      max-height: 500px;
      overflow-y: auto;
    `,
  };
});
