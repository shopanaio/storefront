'use client';

import type { ComponentType, FC } from 'react';
import { SectionContainer } from './SectionContainer';
import {
  SectionId,
} from '@src/modules/checkout/state/interface';
import type { Checkout } from '@src/modules/checkout/types/entity';
import type { AnySchema } from 'yup';

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
  /** View component receiving { value, onValid, onInvalid } */
  Component: ComponentType<{
    data: TData | null;
    onValid: () => void;
    onInvalid: (errors?: Record<string, string>) => void;
  }>;
  /** Selector to read current value for the View from the checkout data */
  selector: (checkout: Checkout.Checkout | null) => TData | null;
  /** Optional Yup validation schema for the section data */
  schema: AnySchema;
  /** Optional display name for React DevTools */
  displayName: string;
}): FC {
  const { id, required = true, Component, selector, schema, displayName } = config;

  const Container: FC = () => {
    return (
      <SectionContainer<K, TData>
        id={id}
        required={required}
        Component={Component}
        selector={selector}
        schema={schema}
      />
    );
  };

  Container.displayName = displayName;
  return Container;
}
