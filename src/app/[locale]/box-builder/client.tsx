"use client";

import { createStack } from "@src/components/BoxBuilder/stackflow/Stack";

interface BoxBuilderClientProps {
  isIOS: boolean;
}

export const BoxBuilderClient = ({ isIOS }: BoxBuilderClientProps) => {
  const { Stack } = createStack(isIOS);

  return <Stack />;
};
