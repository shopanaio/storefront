import type { LayoutProps } from '@src/core/page-builder/types';

interface FullWidthLayoutSettings {
  backgroundColor: string;
  includeHeader: boolean;
  includeFooter: boolean;
}

export default function FullWidthLayout({
  id,
  settings,
  sections,
  children,
}: LayoutProps<FullWidthLayoutSettings>) {
  const {
    backgroundColor = '#ffffff',
    includeHeader = true,
    includeFooter = true,
  } = settings;

  return (
    <div
      id={id}
      style={{
        backgroundColor,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {/* Layout Sections */}
      {sections && sections.length > 0 && includeFooter && (
        <footer style={{ width: '100%' }}>
          {sections}
        </footer>
      )}

      {/* Main Content Area (Page Sections) - Full Width */}
      <main style={{ flex: 1, width: '100%' }}>{children}</main>
    </div>
  );
}
