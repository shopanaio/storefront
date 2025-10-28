import { headers } from 'next/headers';
import { parseUserAgent } from '@src/utils/parseUserAgent';
import { ResponsiveClientProvider } from '@src/providers/responsive-client-provider';

export async function ResponsiveServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAgent = (await headers()).get('user-agent') ?? '';
  const { isMobile, isDesktop } = parseUserAgent(userAgent);

  return (
    <ResponsiveClientProvider isMobile={isMobile} isDesktop={isDesktop}>
      {children}
    </ResponsiveClientProvider>
  );
}
