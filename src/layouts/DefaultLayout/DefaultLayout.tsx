import type { LayoutProps } from '@src/core/page-builder/types';

interface DefaultLayoutSettings {
  backgroundColor: string;
  maxWidth: number;
  stickyHeader: boolean;
}

export default function DefaultLayout({
  id,
  settings,
  sections,
  children,
}: LayoutProps<DefaultLayoutSettings>) {
  const {
    backgroundColor = '#ffffff',
    maxWidth = 1440,
    stickyHeader = true,
  } = settings;

  return (
    <div
      id={id}
      style={{
        backgroundColor,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Layout Sections (Header/Footer) */}
      {sections && sections.length > 0 && (
        <footer>
          {sections}
        </footer>
      )}

      {/* Main Content Area (Page Sections) */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: `${maxWidth}px`,
          margin: '0 auto',
          padding: '0',
        }}
      >
        {children}
      </main>
    </div>
  );
}
