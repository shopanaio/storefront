'use client';

import React from 'react';
import { AntdRegistry as BaseAntdRegistry } from '@ant-design/nextjs-registry';
import {
  StyleProvider as AntdStyleProvider,
  extractStaticStyle,
} from 'antd-style';
import { useServerInsertedHTML } from 'next/navigation';

export function AntdRegistry({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => {
    const styles = extractStaticStyle();
    if (!styles.length) return null;
    return <>{styles.map((item) => item.style)}</>;
  });

  return (
    <BaseAntdRegistry>
      <AntdStyleProvider cache={extractStaticStyle.cache}>
        {children}
      </AntdStyleProvider>
    </BaseAntdRegistry>
  );
}
