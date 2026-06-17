import { IncomeSourceSettingsView } from "@/app/components/income-source-settings-view";

export default async function IncomeSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IncomeSourceSettingsView sourceId={id} />;
}
