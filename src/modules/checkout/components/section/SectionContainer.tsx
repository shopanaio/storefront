'use client';

import type { ComponentType } from 'react';
import { useCallback, useEffect } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import { SectionId } from '@src/modules/checkout/state/interface';
import { Checkout } from '@src/modules/checkout/types';

/**
 * Polymorphic container for Checkout sections.
 *
 * Responsibilities:
 * - Manages section validity based on the `isSectionValid` function.
 * - Injects `checkout` data, an `onDirty` handler, and a set of `operations` into the View.
 * - The View renders the UI and calls the appropriate operation callbacks.
 */
export interface SectionContainerProp<
  K extends SectionId,
  TOperations extends object,
> {
  /** Static or dynamic section id */
  id: K;
  /** Whether the section is required; defaults to true */
  required?: boolean;
  /**
   * An object containing callback functions for data operations.
   * These will be passed as props to the `Component`.
   */
  operations: TOperations;
  /**
   * A function that derives the section's validity from the total checkout data.
   * Called whenever checkout data changes.
   */
  isSectionValid: (checkout: Checkout | null) => boolean;
  /**
   * View component that receives the full checkout data and operation handlers.
   * The View is responsible for mapping checkout data to its form fields
   * and calling `onDirty` when the user starts editing.
   */
  Component: ComponentType<
    {
      checkout: Checkout | null;
      onDirty: () => void;
    } & TOperations
  >;
}

export function SectionContainer<
  K extends SectionId,
  TOperations extends object,
>({
  id,
  required = true,
  Component,
  operations,
  isSectionValid,
}: SectionContainerProp<K, TOperations>) {
  const { publishValid, publishInvalid } = useSectionController(id, {
    required,
  });
  const checkout = useCheckoutStore((s) => s.data.checkout);

  useEffect(() => {
    if (isSectionValid(checkout)) {
      publishValid();
    } else {
      publishInvalid();
    }
  }, [checkout, isSectionValid, publishInvalid, publishValid]);

  const onDirty = useCallback(() => {
    // When the form is dirty, it's not valid until confirmed by the backend.
    publishInvalid();
  }, [publishInvalid]);

  return (
    <Component checkout={checkout} onDirty={onDirty} {...operations} />
  );
}
