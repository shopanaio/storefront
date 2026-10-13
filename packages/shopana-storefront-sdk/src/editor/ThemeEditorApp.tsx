'use client';

import { App, ConfigProvider } from 'antd';
import { ThemeEditorPanel } from './ThemeEditorPanel';

/** Standalone Ant Design application for editing the storefront theme. */
export function ThemeEditorApp() {
  return (
    <ConfigProvider
      theme={{
        cssVar: { prefix: 'shopana-editor' },
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <App>
        <ThemeEditorPanel />
      </App>
    </ConfigProvider>
  );
}
