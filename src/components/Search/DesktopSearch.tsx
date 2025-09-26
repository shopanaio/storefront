import { useRef, useEffect, useState } from "react";
import { Popover } from "antd";
import SearchResults from "./SearchResults";
import { useSearchInput } from "@src/hooks/useSearchInput";
import { mq } from "@src/components/Theme/breakpoints";
import { createStyles } from "antd-style";
import { useElementWidth } from "@src/hooks/useElementWidth";
import { DesktopSearchInput } from "./DesktopSearchInput";

export const DesktopSearch: React.FC = () => {
  const { searchTerm, setSearchTerm, debouncedTerm } = useSearchInput(300);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const popoverWidth = useElementWidth(containerRef);
  const { styles } = useStyles();

  useEffect(() => {
    if (searchTerm.trim()) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  }, [searchTerm]);

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
        <DesktopSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onFocus={handleFocus}
        />
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
      height: var(--components-header-control-height);

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
  };
});
