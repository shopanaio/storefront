'use client';

import type { ComponentType, FC } from 'react';
import { SectionContainer } from './SectionContainer';
import type { SectionDtoFor } from '@src/modules/checkout/state/checkoutBus';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Build a typed section container bound to a specific section id and view.
 *
 * The produced component follows the same pattern as AddressSectionContainer:
 * it selects `value` from the store and passes strictly-typed `onValid`/`onInvalid`
 * into the provided View.
 */
export function makeSection<
  K extends import('@src/modules/checkout/state/checkoutStore').SectionKey,
  TDto extends SectionDtoFor<K>,
  TValue = TDto,
>(config: {
  /** Static or dynamic section id */
  id: K;
  /** Whether the section is required; defaults to true */
  required?: boolean;
  /** View component receiving { value, onValid, onInvalid } */
  Component: ComponentType<{
    value: TValue | null;
    onValid: (dto: TDto) => void;
    onInvalid: (errors?: Record<string, string>) => void;
  }>;
  /** Selector to read current value for the View from the store */
  selector?: (state: CheckoutState) => TValue | null;
  /** Optional display name for React DevTools */
  displayName: string;
}): FC {
  const { id, required = true, Component, selector, displayName } = config;

  const Container: FC = () => {
    return (
      <SectionContainer<K, TDto, TValue>
        id={id}
        required={required}
        Component={Component}
        selector={selector}
      />
    );
  };

  Container.displayName = displayName;
  return Container;
}
