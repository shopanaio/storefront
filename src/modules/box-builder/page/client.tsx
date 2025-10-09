'use client';

import { useMemo } from 'react';
import { createStack } from '@src/modules/box-builder/Stack';
import { useSyncCartState } from '@src/modules/box-builder/hooks/useSyncCartState';

interface BoxBuilderClientProps {
  isIOS: boolean;
}

export const BoxBuilderClient = ({ isIOS }: BoxBuilderClientProps) => {
  const { Stack } = useMemo(() => createStack(isIOS), [isIOS]);

  useSyncCartState();

  return <Stack />;
};
