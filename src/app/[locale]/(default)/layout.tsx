import { Layout as PageLayout } from "@src/components/Layout/Layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <PageLayout>{children}</PageLayout>;
}
