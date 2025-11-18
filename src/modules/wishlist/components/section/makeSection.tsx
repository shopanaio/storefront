'use client';

import { ComponentType, FC } from 'react';
import { WishlistSectionId, WishlistSnapshot } from '@src/modules/wishlist/types';
import { SectionContainer } from '@src/modules/wishlist/components/section/SectionContainer';
import { AnySchema } from 'yup';

export function makeSection<TData extends object>({
  id,
  required = true,
  Component,
  selector,
  schema,
  displayName,
}: {
  id: WishlistSectionId;
  required?: boolean;
  Component: ComponentType<{ data: TData | null; invalidate: () => void }>;
  selector?: (snapshot: WishlistSnapshot) => TData | null;
  schema?: AnySchema;
  displayName: string;
}): FC {
  const Container: FC = () => (
    <SectionContainer<TData>
      id={id}
      required={required}
      Component={Component}
      selector={selector}
      schema={schema}
    />
  );
  Container.displayName = displayName;
  return Container;
}
