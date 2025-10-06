'use client';

import type { ComponentType } from 'react';
import { useCallback } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import {
  SectionId,
} from '@src/modules/checkout/state/interface';
import type { Checkout } from '@src/modules/checkout/types/entity';

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
export interface SectionContainerProp<K extends SectionId, TData = unknown> {
  /** Static or dynamic section id */
  id: K;
  /** Whether the section is required; defaults to true */
  required?: boolean;
  /**
   * View component that receives strictly-typed handlers and external props.
   * The View is responsible for producing a valid section DTO when calling `onValid`.
   */
  Component: ComponentType<{
    data: TData | null;
    onValid: () => void;
    onInvalid: (errors?: Record<string, string>) => void;
  }>;
  /**
   * Selector to read current value for the View from the checkout data (e.g., form data).
   * If omitted, `value` will be null.
   */
  selector?: (checkout: Checkout.Checkout | null) => TData | null;
}

export function SectionContainer<K extends SectionId, TData extends object>({
  id,
  required = true,
  Component,
  selector,
}: SectionContainerProp<K, TData>) {
  const { publishValid, publishInvalid } = useSectionController(id, {
    required,
  });
  const { checkout } = useCheckoutData();

  const data = selector ? selector(checkout) : null;

  const onValid = useCallback(() => {
    publishValid();
  }, [publishValid]);

  const onInvalid = useCallback(
    (errors?: Record<string, string>) => {
      publishInvalid(errors);
    },
    [publishInvalid]
  );

  return <Component data={data} onValid={onValid} onInvalid={onInvalid} />;
}
