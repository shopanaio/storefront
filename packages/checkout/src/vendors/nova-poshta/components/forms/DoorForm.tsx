'use client';

import { Alert, Flex } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';
import type { ProviderDeliveryAddress } from '#checkout/vendors/types';
import { StreetModal } from '../street/StreetModal';
import { readSettlementRef } from '../../address';
import { doorInput, readInput } from '../../customerInput';
import type { DoorView, Street } from '../../types';

interface DoorFormProps {
  data: unknown;
  view?: unknown;
  onSubmit: (data: unknown, view?: unknown) => void;
  deliveryAddress?: ProviderDeliveryAddress | null;
}

interface DoorFields {
  street: { ref: string; name: string; present: string } | null;
  building: string;
  apartment: string;
  comment: string;
}

const fieldsOf = (data: unknown, view: unknown, settlementRef: string | null): DoorFields => {
  const input = readInput(data, 'DOOR', settlementRef);
  return {
    street: input
      ? {
          ref: input.streetRef,
          name: input.streetName,
          present: (view as DoorView | undefined)?.streetPresent ?? input.streetName,
        }
      : null,
    building: input?.building ?? '',
    apartment: input?.apartment ?? '',
    comment: input?.comment ?? '',
  };
};

/**
 * Courier delivery: a street from the carrier directory, building, optional apartment and
 * a note for the courier. Once a street is picked every change is submitted; the checkout
 * saves the input when it satisfies the contract (building filled in) and typing pauses.
 */
export function DoorForm({ deliveryAddress, ...props }: DoorFormProps) {
  const settlementRef = readSettlementRef(deliveryAddress);
  // A new settlement starts the courier address over and drops a pending submit.
  return (
    <CourierFields key={settlementRef ?? ''} settlementRef={settlementRef} {...props} />
  );
}

function CourierFields({
  data,
  view,
  onSubmit,
  settlementRef,
}: Omit<DoorFormProps, 'deliveryAddress'> & { settlementRef: string | null }) {
  const t = useTranslations('Modules.novaPoshta.form');
  const [fields, setFields] = useState<DoorFields>(() =>
    fieldsOf(data, view, settlementRef)
  );

  const submit = (next: DoorFields) => {
    if (!settlementRef || !next.street) {
      return;
    }
    const streetView: DoorView = { streetPresent: next.street.present };
    onSubmit(
      doorInput({
        settlementRef,
        streetRef: next.street.ref,
        streetName: next.street.name,
        building: next.building,
        apartment: next.apartment,
        comment: next.comment,
      }),
      streetView
    );
  };

  const change = (patch: Partial<DoorFields>) => {
    const next = { ...fields, ...patch };
    setFields(next);
    submit(next);
  };

  const handleChangeStreet = (street: Street) =>
    change(
      { street: { ref: street.ref, name: street.name, present: street.present } }
    );

  const disabled = !settlementRef;

  return (
    <Flex vertical gap={12}>
      <StreetModal
        streetPresent={fields.street?.present ?? null}
        changeStreet={handleChangeStreet}
        settlementRef={settlementRef}
      />
      {disabled && (
        <Alert message={t('city_required_warning')} type="warning" showIcon />
      )}
      <Flex gap={12}>
        <FloatingLabelInput
          label={t('building')}
          value={fields.building}
          maxLength={50}
          onChange={(e) => change({ building: e.target.value })}
          disabled={disabled}
        />
        <FloatingLabelInput
          label={t('apartment')}
          value={fields.apartment}
          maxLength={50}
          onChange={(e) => change({ apartment: e.target.value })}
          disabled={disabled}
        />
      </Flex>
      <FloatingLabelInput
        label={t('comment')}
        value={fields.comment}
        maxLength={500}
        onChange={(e) => change({ comment: e.target.value })}
        disabled={disabled}
      />
    </Flex>
  );
}
