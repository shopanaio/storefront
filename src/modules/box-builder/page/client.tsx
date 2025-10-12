'use client';

import { useMemo } from 'react';
import { createStack } from '@src/modules/box-builder/Stack';
import { useSyncCartState } from '@src/modules/box-builder/hooks/useSyncCartState';

export const BoxBuilderClient = () => {
  const { Stack } = useMemo(() => createStack(), []);

  useSyncCartState();

  return <Stack />;
};
