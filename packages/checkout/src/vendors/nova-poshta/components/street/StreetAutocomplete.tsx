'use client';

import { Dropdown } from 'antd';
import type { DropdownProps } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { PiMapPin } from 'react-icons/pi';
import { FloatingLabelInput } from '@shopana/storefront-ui';
import { useSearchInput } from '#checkout/hooks/useSearchInput';
import { useStreetSearch } from '../../api/directory';
import { DirectoryNotice } from '../DirectoryNotice';
import type { Street } from '../../types';

interface StreetAutocompleteProps {
  /** Label of the picked street. */
  streetPresent: string | null;
  changeStreet: (street: Street) => void;
  settlementRef: string | null;
}

export interface MatchSegment {
  text: string;
  match: boolean;
}

/** Splits `text` into the parts that match the search text (case-insensitive) and the rest. */
export function matchSegments(text: string, term: string): MatchSegment[] {
  const needle = term.trim().toLocaleLowerCase();
  if (!needle) {
    return [{ text, match: false }];
  }
  const haystack = text.toLocaleLowerCase();
  const segments: MatchSegment[] = [];
  let from = 0;
  for (
    let at = haystack.indexOf(needle);
    at !== -1;
    at = haystack.indexOf(needle, from)
  ) {
    if (at > from) {
      segments.push({ text: text.slice(from, at), match: false });
    }
    segments.push({ text: text.slice(at, at + needle.length), match: true });
    from = at + needle.length;
  }
  if (from < text.length) {
    segments.push({ text: text.slice(from), match: false });
  }
  return segments;
}

/**
 * Street of a settlement from the carrier directory: the field shows the picked street,
 * typing searches the directory and opens a menu of matching streets with the typed text
 * highlighted. Arrows move through the menu, Enter picks, Escape or leaving the field
 * keeps the street picked before.
 */
export const StreetAutocomplete = ({
  streetPresent,
  changeStreet,
  settlementRef,
}: StreetAutocompleteProps) => {
  const t = useTranslations('Modules.novaPoshta.form');
  const { styles } = useStyles();
  const popup = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { searchTerm, setSearchTerm, debouncedTerm } = useSearchInput();
  const streets = useStreetSearch(
    editing ? settlementRef : null,
    debouncedTerm
  );

  const items = streets.items;
  const active = Math.min(activeIndex, Math.max(items.length - 1, 0));
  // The rows answer the debounced text; until it catches up a new search is pending.
  const pending = searchTerm.trim() !== debouncedTerm.trim();
  const open = editing && !!settlementRef && searchTerm.trim().length > 0;

  useEffect(() => {
    if (open) {
      popup.current
        ?.querySelector('.ant-dropdown-menu-item-active')
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [open, active]);

  const cancel = () => {
    setEditing(false);
    setSearchTerm('');
    setActiveIndex(0);
  };

  const pick = (street: Street) => {
    changeStreet(street);
    cancel();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (items.length > 0) {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((active + step + items.length) % items.length);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const street = items[active];
      if (street) {
        pick(street);
      }
    } else if (event.key === 'Escape') {
      cancel();
    }
  };

  const menu: DropdownProps['menu'] = {
    activeKey: items[active]?.ref,
    items: items.map((street, index) => ({
      key: street.ref,
      icon: <PiMapPin size={18} />,
      label: (
        <span>
          {matchSegments(street.present, searchTerm).map((segment, at) =>
            segment.match ? (
              <mark key={at} className={styles.match}>
                {segment.text}
              </mark>
            ) : (
              <span key={at}>{segment.text}</span>
            )
          )}
        </span>
      ),
      onMouseEnter: () => setActiveIndex(index),
    })),
    onClick: ({ key }) => {
      const street = items.find((item) => item.ref === key);
      if (street) {
        pick(street);
      }
    },
  };

  return (
    <Dropdown
      open={open}
      trigger={[]}
      placement="bottomLeft"
      menu={menu}
      popupRender={(menuNode) => (
        // Pressing inside the menu must not take the focus off the field and close it.
        <div
          ref={popup}
          className={styles.popup}
          onMouseDown={(event) => event.preventDefault()}
        >
          {items.length > 0 ? (
            menuNode
          ) : (
            <div className={styles.notice}>
              <DirectoryNotice
                loading={streets.loading || pending}
                error={streets.error}
                empty={!pending && !streets.loading}
                onRetry={streets.retry}
              />
            </div>
          )}
        </div>
      )}
    >
      <div className={styles.trigger}>
        <FloatingLabelInput
          label={t('street')}
          value={editing ? searchTerm : (streetPresent ?? '')}
          disabled={!settlementRef}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          onFocus={(event) => event.target.select()}
          onBlur={cancel}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setEditing(true);
            setSearchTerm(event.target.value);
            setActiveIndex(0);
          }}
        />
      </div>
    </Dropdown>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  trigger: css`
    width: 100%;
  `,
  popup: css`
    max-height: 320px;
    overflow-y: auto;
    background: ${token.colorBgElevated};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: ${token.boxShadowSecondary};

    .ant-dropdown-menu {
      box-shadow: none;
    }
  `,
  notice: css`
    padding: ${token.paddingSM}px ${token.padding}px;
  `,
  match: css`
    padding: 0;
    color: inherit;
    font-weight: ${token.fontWeightStrong};
    background: transparent;
  `,
}));
