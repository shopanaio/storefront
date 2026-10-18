'use client';

import type { ComponentType, FC } from 'react';
import { SectionContainer } from './SectionContainer';
import { SectionId } from '#checkout/state/interface';
import type { Checkout } from '#checkout/types/entity';
import type { AnySchema, Lazy } from 'yup';

/**
 * Build a typed section container bound to a specific section id and view.
 *
 * The produced component follows the same pattern as AddressSectionContainer:
 * it selects `value` from the checkout data and passes strictly-typed `onValid`/`onInvalid`
 * into the provided View.
 */
export function makeSection<
  TData extends object,
  K extends SectionId = SectionId,
>(config: {
  /** Static or dynamic section id */
  id: K;
  /** Whether the section is required; defaults to true */
  required?: boolean;
  /** View component receiving { data, invalidate } */
  Component: ComponentType<{
    data: TData | null;
    invalidate: () => void;
  }>;
  /** Selector to read current value for the View from the checkout data */
  selector: (checkout: Checkout.Checkout | null) => TData | null;
  /** Optional hook completing the selected data with client-side state */
  useData?: (data: TData | null) => TData | null;
  /** Optional Yup validation schema for the section data */
  schema: AnySchema | Lazy<unknown>;
  /** Optional display name for React DevTools */
  displayName: string;
}): FC {
  const {
    id,
    required = true,
    Component,
    selector,
    useData,
    schema,
    displayName,
  } = config;

  const Container: FC = () => {
    return (
      <SectionContainer<K, TData>
        id={id}
        required={required}
        Component={Component}
        selector={selector}
        useData={useData}
        schema={schema}
      />
    );
  };

  Container.displayName = displayName;
  return Container;
}
