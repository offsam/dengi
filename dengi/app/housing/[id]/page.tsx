import { HousingBillSettingsView } from "@/app/components/housing-bill-settings-view";

export default async function HousingBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HousingBillSettingsView billId={id} />;
}
