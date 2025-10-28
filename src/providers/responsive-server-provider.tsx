import { headers, type UnsafeUnwrappedHeaders } from "next/headers";
import { parseUserAgent } from "@src/utils/parseUserAgent";
import { ResponsiveClientProvider } from "@src/providers/responsive-client-provider";

export function ResponsiveServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAgent = (headers() as unknown as UnsafeUnwrappedHeaders).get("user-agent") ?? "";
  const { isMobile, isDesktop } = parseUserAgent(userAgent);

  return (
    <ResponsiveClientProvider isMobile={isMobile} isDesktop={isDesktop}>
      {children}
    </ResponsiveClientProvider>
  );
}
