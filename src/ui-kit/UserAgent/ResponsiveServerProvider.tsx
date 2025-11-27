import { headers } from 'next/headers';
import { parseUserAgent } from './parseUserAgent';
import { ResponsiveClientProvider } from './ResponsiveClientProvider';

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
