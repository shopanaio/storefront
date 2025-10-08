'use client';

import type { ComponentType } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import { SectionId } from '@src/modules/checkout/state/interface';
import type { Checkout } from '@src/modules/checkout/types/entity';
import type { AnySchema } from 'yup';
import { extractYupErrors } from '@src/modules/checkout/utils/validation';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

/**
 * Polymorphic container for Checkout sections.
 *
 * Responsibilities:
 * - Registers the section lifecycle via `useSectionController`.
 * - Automatically validates data from selector against the schema.
 * - Publishes validation state changes (valid/invalid).
 * - Exposes `onChange` handler to the View for field updates.
 */
export interface SectionContainerProp<K extends SectionId, TData = unknown> {
  /** Static or dynamic section id */
  id: K;
  /** Whether the section is required; defaults to true */
  required: boolean;
  /**
   * View component that receives data and invalidate function.
   * The View is responsible for rendering UI.
   */
  Component: ComponentType<{
    data: TData | null;
    invalidate: () => void;
  }>;
  /**
   * Selector to read current value for the View from the checkout data (e.g., form data).
   * If omitted, `value` will be null.
   */
  selector?: (checkout: Checkout.Checkout | null) => TData | null;
  /**
   * Yup validation schema for the section data.
   * Data will be validated automatically on mount and when data changes.
   */
  schema: AnySchema;
}

export function SectionContainer<K extends SectionId, TData extends object>({
  id,
  required,
  Component,
  selector,
  schema,
}: SectionContainerProp<K, TData>) {
  const { publishValid, publishInvalid } = useSectionController(id, {
    required,
  });
  const { checkout } = useCheckoutData();

  // Read 'required' flag from store (can be updated dynamically)
  const requiredFromStore = useCheckoutStore(
    (state) => state.sections[id]?.required ?? required
  );

  const data = useMemo(() => {
    if (!selector) {
      return null;
    }

    return selector(checkout);
  }, [selector, checkout]);

  // Automatically validate data from selector
  useEffect(() => {
    /**
     * If the section is not required or has no schema or data,
     * we consider the section as valid.
     *
     * Use requiredFromStore instead of prop 'required' to support
     * dynamic required changes (e.g., recipient section).
     */
    if (!requiredFromStore || !schema || !data) {
      publishValid();
      return;
    }

    schema
      .validate(data, { abortEarly: false })
      .then(publishValid)
      .catch((error) => {
        publishInvalid(extractYupErrors(error));
      });
  }, [data, schema, publishValid, publishInvalid, requiredFromStore]);

  const invalidate = useCallback(() => {
    publishInvalid({});
  }, [publishInvalid]);

  return <Component data={data} invalidate={invalidate} />;
}
