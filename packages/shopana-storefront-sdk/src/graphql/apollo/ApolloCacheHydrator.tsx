'use client';

import type { NormalizedCacheObject } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { mergeApolloCacheStates } from './cache';

export interface ApolloCacheHydratorProps {
  state: NormalizedCacheObject;
  children: ReactNode;
}

/** Applies one page snapshot before any descendant Apollo hook renders. */
export function ApolloCacheHydrator({
  state,
  children,
}: ApolloCacheHydratorProps) {
  const client = useApolloClient();
  useState(() => {
    client.cache.restore(
      mergeApolloCacheStates(client.extract() as NormalizedCacheObject, state)
    );
    return true;
  });

  return children;
}
