"use client";

import { createStack } from "@src/modules/box-builder/stackflow/Stack";

interface BoxBuilderClientProps {
  isIOS: boolean;
}

export const BoxBuilderClient = ({ isIOS }: BoxBuilderClientProps) => {
  const { Stack } = createStack(isIOS);

  return <Stack />;
};
