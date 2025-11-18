'use client';

import { WishlistController } from '@src/modules/wishlist/components/WishlistController';
import { WishlistView } from '@src/modules/wishlist/components/WishlistView';
import { useValidationAlert } from '@src/modules/wishlist/hooks/useValidationAlert';
import { WishlistFeatures } from '@src/modules/wishlist/types';

interface WishlistProps {
  brand?: React.ReactNode;
  features?: WishlistFeatures;
  onSync?: () => void;
}

export const Wishlist = ({ brand, features, onSync }: WishlistProps) => {
  const { validationError, onClearError } = useValidationAlert();

  return (
    <>
      <WishlistController onSync={onSync} />
      <WishlistView
        brand={brand}
        features={features}
        validationError={validationError}
        onClearError={onClearError}
      />
    </>
  );
};
