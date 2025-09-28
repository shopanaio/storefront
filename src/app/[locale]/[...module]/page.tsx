import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const moduleName = module[0];

  if (!moduleName) {
    return redirect("/");
  }

  return <div>Module: {JSON.stringify(module)}</div>;
}
