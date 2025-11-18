'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import { useTranslations } from 'next-intl';
import {
  computeMissingRequiredSections,
  useWishlistStore,
} from '@src/modules/wishlist/state/wishlistStore';
import {
  onWishlistEvent,
  WishlistEvent,
} from '@src/modules/wishlist/state/wishlistBus';
import { WishlistSectionId } from '@src/modules/wishlist/types';

const sectionLabels: Record<WishlistSectionId, string> = {
  [WishlistSectionId.SavedItems]: 'saved-items',
};

export const useValidationAlert = () => {
  const t = useTranslations('Wishlist');
  const [message, setMessage] = useState<string | null>(null);

  const safeTranslate = useMemo(
    () => (key: string, fallback: string) => {
      try {
        return t(key, { defaultMessage: fallback });
      } catch {
        return fallback;
      }
    },
    [t]
  );

  const buildMessage = useCallback(
    (missing: WishlistSectionId[]) => {
      if (!missing.length) return null;
      const names = missing.map((sectionId) =>
        safeTranslate(`sections.${sectionLabels[sectionId]}`, sectionId)
      );
      const template = safeTranslate(
      'validation.fill-sections',
      'Complete sections: {sections}'
      );
      return template.replace('{sections}', [...new Set(names)].join(', '));
    },
    [safeTranslate]
  );

  const debouncedUpdate = useMemo(
    () =>
      debounce((next: string | null) => {
        setMessage(next);
      }, 250),
    []
  );

  useEffect(() => {
    const offSaved = onWishlistEvent(
      WishlistEvent.WishlistCleared,
      () => setMessage(null)
    );
    const offUpdated = onWishlistEvent(
      WishlistEvent.WishlistUpdated,
      () => {
        if (!message) return;
        const missing = computeMissingRequiredSections(
          useWishlistStore.getState()
        );
        debouncedUpdate(buildMessage(missing));
      }
    );

    return () => {
      offSaved();
      offUpdated();
      debouncedUpdate.cancel();
    };
  }, [message, debouncedUpdate, safeTranslate, buildMessage]);

  useEffect(() => {
    const offInvalid = onWishlistEvent(
      WishlistEvent.SectionInvalid,
      () => {
        const missing = computeMissingRequiredSections(
          useWishlistStore.getState()
        );
        setMessage(buildMessage(missing));
      }
    );

    return () => {
      offInvalid();
    };
  }, [buildMessage]);

  useEffect(() => {
    const offValid = onWishlistEvent(WishlistEvent.SectionValid, () => {
      if (!message) return;
      const missing = computeMissingRequiredSections(
        useWishlistStore.getState()
      );
      setMessage(buildMessage(missing));
    });
    return () => {
      offValid();
    };
  }, [message, buildMessage]);

  return {
    validationError: message,
    onClearError: () => setMessage(null),
  };
};
