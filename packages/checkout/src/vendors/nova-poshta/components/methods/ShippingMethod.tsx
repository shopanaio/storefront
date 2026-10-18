'use client';

import type { FC } from 'react';
import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '#checkout/components/common/CheckoutMethodPanel';
import { contractBranch } from '#checkout/utils/jsonSchema';
import type { ProviderMethodComponentProps } from '#checkout/vendors/types';
import { DoorForm } from '../forms/DoorForm';
import { PointForm } from '../forms/PointForm';
import { NPLogo } from '../Logo';
import { SERVICE_RECEIVING_TYPE } from '../../customerInput';
import type { ServiceCode } from '../../types';

/**
 * Method component of a Nova Poshta service. The form follows the receiving type of the
 * service: a branch or a postomat from the directory, or a courier address. The option is
 * hidden when its contract has no branch for that type.
 *
 * Services differ by how the parcel leaves the seller too (`doors-warehouse` next to
 * `warehouse-warehouse`), so each service has its own name. A title the API gives in
 * words wins; today the app returns the service code there.
 */
export function createShippingMethod(code: ServiceCode): FC<ProviderMethodComponentProps> {
  const type = SERVICE_RECEIVING_TYPE[code];
  function NovaPoshtaShippingMethod({
    title,
    isActive,
    onActive,
    description,
    customerInputContract,
    data,
    view,
    onSubmit,
    deliveryAddress,
  }: ProviderMethodComponentProps) {
    const t = useTranslations('Modules.novaPoshta');

    if (!contractBranch(customerInputContract, type)) {
      return null;
    }

    return (
      <CheckoutMethodPanel
        title={title && title !== code ? title : t(`shipping.services.${code}`)}
        description={description ?? null}
        isActive={isActive}
        onActive={onActive}
        brand={<NPLogo size={24} />}
        component={type === 'DOOR' ? DoorForm : PointForm}
        componentProps={{ data, view, onSubmit, deliveryAddress, type }}
      />
    );
  }
  NovaPoshtaShippingMethod.displayName = `NovaPoshtaShippingMethod(${code})`;
  return NovaPoshtaShippingMethod;
}
