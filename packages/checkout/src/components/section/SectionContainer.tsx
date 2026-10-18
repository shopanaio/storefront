'use client';

import type { ComponentType } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSectionController } from '#checkout/state/hooks/useSectionController';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { SectionId } from '#checkout/state/interface';
import type { Checkout } from '#checkout/types/entity';
import type { AnySchema, Lazy } from 'yup';
import { extractYupErrors } from '#checkout/utils/validation';
import { useCheckoutStore } from '#checkout/state/checkoutStore';

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
    /**
     * Keeps the section invalid whatever its data, while the view knows the data is not what
     * the buyer is entering (e.g. an address of another country); `false` validates it again.
     */
    holdInvalid?: (held: boolean) => void;
  }>;
  /**
   * Selector to read current value for the View from the checkout data (e.g., form data).
   * If omitted, `value` will be null.
   */
  selector?: (checkout: Checkout.Checkout | null) => TData | null;
  /**
   * Hook that completes the selected data with client-side state the API does not return
   * (e.g. delivery customer input). The result is both rendered and validated.
   */
  useData?: (data: TData | null) => TData | null;
  /**
   * Yup validation schema for the section data.
   * Data will be validated automatically on mount and when data changes.
   */
  schema: AnySchema | Lazy<unknown>;
}

const useSelectedData = <TData,>(data: TData | null) => data;

export function SectionContainer<K extends SectionId, TData extends object>({
  id,
  required,
  Component,
  selector,
  useData: useSectionData = useSelectedData,
  schema,
}: SectionContainerProp<K, TData>) {
  const { busy, publishValid, publishInvalid } = useSectionController(id, {
    required,
  });
  const { checkout } = useCheckoutData();

  // Read 'required' flag from store (can be updated dynamically)
  const requiredFromStore = useCheckoutStore(
    (state) => state.sections[id]?.required ?? required
  );

  const selected = useMemo(() => {
    if (!selector) {
      return null;
    }

    return selector(checkout);
  }, [selector, checkout]);
  const data = useSectionData(selected);
  // Set by the view through `holdInvalid`.
  const [held, setHeld] = useState(false);

  // Automatically validate data from selector.
  // While an operation of the section is running the section stays invalid
  // (set on OperationStart); it is re-validated when the section stops being busy,
  // including after a failed operation that did not change the data.
  useEffect(() => {
    if (busy) {
      return;
    }
    if (held && requiredFromStore) {
      publishInvalid({});
      return;
    }

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

    let cancelled = false;
    schema
      .validate(data, { abortEarly: false })
      .then(() => {
        if (!cancelled) publishValid();
      })
      .catch((error) => {
        if (!cancelled) publishInvalid(extractYupErrors(error));
      });

    return () => {
      cancelled = true;
    };
  }, [busy, held, data, schema, publishValid, publishInvalid, requiredFromStore]);

  const invalidate = useCallback(() => {
    publishInvalid({});
  }, [publishInvalid]);

  return <Component data={data} invalidate={invalidate} holdInvalid={setHeld} />;
}
