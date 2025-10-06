'use client';

import type { ComponentType } from 'react';
import { useCallback } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import type { SectionDtoFor } from '@src/modules/checkout/state/checkoutBus';
import {
  useCheckoutStore,
  type CheckoutState,
} from '@src/modules/checkout/state/checkoutStore';

/**
 * Polymorphic container for Checkout sections.
 *
 * Responsibilities:
 * - Registers the section lifecycle via `useSectionController`.
 * - Exposes strictly typed `onValid`/`onInvalid` to the View.
 * - Accepts View props directly (no internal prop computation).
 *
 * Mapping responsibility stays in the View: it must call `onValid` with the
 * section-specific DTO type.
 */
export interface SectionContainerProp<
  K extends import('@src/modules/checkout/state/checkoutStore').SectionKey,
  TDto extends SectionDtoFor<K>,
  TValue = TDto,
> {
  /** Static or dynamic section id */
  id: K;
  /** Whether the section is required; defaults to true */
  required?: boolean;
  /**
   * View component that receives strictly-typed handlers and external props.
   * The View is responsible for producing a valid section DTO when calling `onValid`.
   */
  Component: ComponentType<{
    value: TValue | null;
    onValid: (dto: TDto) => void;
    onInvalid: (errors?: Record<string, string>) => void;
  }>;
  /**
   * Selector to read current value for the View from the store (e.g., form data).
   * If omitted, `value` will be null.
   */
  selector?: (state: CheckoutState) => TValue | null;
}

export function SectionContainer<
  K extends import('@src/modules/checkout/state/checkoutStore').SectionKey,
  TDto extends SectionDtoFor<K>,
  TValue = TDto,
>({
  id,
  required = true,
  Component,
  selector,
}: SectionContainerProp<K, TDto, TValue>) {
  const { publishValid, publishInvalid } = useSectionController<K>(id, {
    required,
  });
  const valueSelector: (state: CheckoutState) => TValue | null = selector
    ? (s: CheckoutState) => selector(s)
    : (_: CheckoutState) => null as TValue | null;
  const value = useCheckoutStore(valueSelector) as TValue | null;

  const onValid = useCallback(
    (dto: TDto) => {
      publishValid(dto);
    },
    [publishValid]
  );

  const onInvalid = useCallback(
    (errors?: Record<string, string>) => {
      publishInvalid(errors);
    },
    [publishInvalid]
  );

  return <Component value={value} onValid={onValid} onInvalid={onInvalid} />;
}
