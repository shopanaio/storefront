"use client";

import React, { useRef } from "react";
import {
  StyleProvider as AntdStyleProvider,
  extractStaticStyle,
} from "antd-style";
import { useServerInsertedHTML } from "next/navigation";

export function AntdRegistry({ children }: { children: React.ReactNode }) {
  const isInsert = useRef(false);

  useServerInsertedHTML(() => {
    if (isInsert.current) return;
    isInsert.current = true;
    return <>{extractStaticStyle().map((item) => item.style)}</>;
  });

  return (
    <AntdStyleProvider cache={extractStaticStyle.cache}>
      {children}
    </AntdStyleProvider>
  );
}
