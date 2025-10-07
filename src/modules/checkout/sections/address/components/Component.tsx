'use client';

import {
  City,
  CitySelect,
} from '@src/modules/checkout/sections/delivery/components/city/CitySelect';
import type { AddressFormData } from '../types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';
import { useCallback, useEffect, useState } from 'react';

export interface AddressSectionViewProps {
  /** Current form data */
  data: AddressFormData | null;
}

export const AddressSectionView = ({ data }: AddressSectionViewProps) => {
  const { updateDeliveryAddresses, addDeliveryAddresses } = useCheckoutApi();
  const addressId = data?.addressId;

  const [city, setCity] = useState<City | null>(data?.city ?? null);

  useEffect(() => {
    setCity(data?.city ?? null);
  }, [data?.city?.Ref]);

  const onSubmit = useCallback(
    (city: City) => {
      setCity(city);

      if (!addressId) {
        addDeliveryAddresses({
          addresses: [
            {
              city: city.MainDescription,
              // @ts-expect-error TODO: make partial address type and add metadata
              metadata: city,
            },
          ],
        });
        return;
      }

      updateDeliveryAddresses({
        updates: [
          {
            addressId,
            address: {
              city: city.MainDescription,
              // @ts-expect-error TODO: make partial address type and add metadata
              metadata: city,
            },
          },
        ],
      });
    },
    [updateDeliveryAddresses]
  );

  return <CitySelect city={city} onSubmit={onSubmit} />;
};

export default AddressSectionView;
